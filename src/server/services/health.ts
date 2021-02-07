import * as cluster from 'cluster';
import * as inspector from 'inspector';
import { Server } from 'net';
import { BehaviorSubject, forkJoin, Observable, of, race, timer } from 'rxjs';
import { distinctUntilChanged, switchMap, take, tap } from 'rxjs/operators';
import { LoggingService } from './logger';

const EXIT_SIGNALS: string[] = [
  'SIGINT',
  'SIGTERM',
  'SIGHUP',
  'SIGQUIT',
]

export class HealthService {

  private _isHealthy: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private _servers: Server[] = [];
  private _services = [];
  private _listeners = [];

  constructor(
    private _logger: LoggingService
  ) { }

  init() {
    EXIT_SIGNALS.forEach(s => {
      this._listeners.push(
        process.on(s, () => {
          this._handleExitSignal(s);
        })
      );
    });

    if (cluster.isWorker) {
      cluster.worker.on('message', (msg) => {
        if (EXIT_SIGNALS.indexOf(msg) >= 0) {
          if (!this._isHealthy.value) {
            this._logger.log(`${msg} ignored. Process is already terminating`);
            return;
          }
          this._isHealthy.next(false);
          this._logger.log(`shutting down...`);
          this._cleanup(msg)
          .subscribe(
            _ => {
              this._logger.log('Goodbye.');
              process.exit(0);
            },
            err => {
              this._logger.logError(err);
              this._logger.log('Goodbye.');
              process.exit(1);
          });
        }
      });
    }
  }

  setHealthy(isHealthy: boolean) {
    this._isHealthy.next(isHealthy);
  }

  checkClusterHealth() {
    this._isHealthy.next(this.getLivingWorkers().length > 0);
  }

  registerServer(server: Server) {
    this._servers.push(server);
  }

  registerService(service) {
    this._services.push(service);
  }

  isHealthy(): boolean {
    return this._isHealthy.value;
  }

  observeHealhy(): Observable<boolean> {
    return this._isHealthy.pipe(
      distinctUntilChanged()
    );
  }

  getLivingWorkers(): cluster.Worker[] {
    const workers: cluster.Worker[] = [];
    for (const id in cluster.workers) {
      workers.push(cluster.workers[id]);
    }
    const alive = workers.filter(w => !w.isDead());
    // this._logger.log('living workers', alive.map(w => w.id));
    return alive;
  }

  private _cleanup(signal) {
    if (inspector && inspector.url()) {
      this._logger.log('closing inspector');
      inspector.close();
    }
    if (cluster.isMaster) {
      return forkJoin([
        of(true),
        ...(this._servers.map(s => this._closeServer(s)))
      ]).pipe(
        switchMap(_ => {
          return race(
            this._cleanupWorkers(signal),
            timer(10 * 1000)
            .pipe(
              take(1),
              tap(_ => {
                this._logger.log('[ master ]: Workers took too long to shut down');
                this.getLivingWorkers().forEach(w => w.kill('SIGKILL'));
              })
            )
          );
        }),
        switchMap(_ => {
          return forkJoin([
            of(true),
            ...this._services.map(s => this._cleanupService(s))
          ]);
        })
      );
    } else {
      return forkJoin([
        of(true),
        ...(this._servers.map(s => this._closeServer(s)))
      ]).pipe(
        switchMap(_ => {
          this._logger.log('All servers closed');
          return forkJoin([
            of(true),
            ...this._services.map(s => this._cleanupService(s))
          ]);
        })
      );
    }
  }

  private _handleExitSignal(signal: string) {
    if (cluster.isMaster) {
      if (!this._isHealthy.value) {
        this._logger.log(`${signal} ignored. Process is already terminating`);
        return;
      }
      this._isHealthy.next(false);
      this._logger.log(`[ master ]: caught ${signal}. shutting down...`);
      this._cleanup(signal)
      .subscribe(_ => {
        this._logger.log(`[ master ]: Goodbye.`);
        process.exit(0)
      }, err => {
        this._logger.logError(err);
        process.exit(1);
      });
    } else {
      // workers wait to die
      return;
    }
  }

  private _closeServer(server: Server): Observable<any> {
    return new Observable(obs => {
      server.close(() => {
        obs.next('closed');
        obs.complete();
      })
    });
  }

  private _cleanupWorkers(signal): Observable<any> {
    if (!cluster.isMaster) {
      return of(true);
    }
    this.getLivingWorkers().forEach(w => {
      w.send(signal);
    });
    return new Observable(obs => {
      cluster.disconnect(() => {
        obs.next(true);
        obs.complete();
      });
    });
  }

  // private _cleanupWorker(worker: cluster.Worker, signal: string): Observable<any> {
  //   return new Observable(obs => {
  //     worker.on('exit', (code, signal) => {
  //       if (this._timeouts[worker.id]) {
  //         clearTimeout(this._timeouts[worker.id]);
  //       }
  //       obs.next(`${worker.id} exited`);
  //       obs.complete();
  //     });

  //     worker.kill(signal);
  //     this._timeouts[worker.id] = setTimeout(() => {
  //       this._logger.log('worker shutdown time expired. forcefully killing worker', worker.id);
  //       worker.process.kill('SIGKILL');
  //     }, 6000); // based on maximum `keep-alive` timeout
  //   });
  // }

  private _cleanupService(service): Observable<any> {
    if (service && service.cleanup) {
      return service.cleanup();
    } else {
      return of(true);
    }
  }

}
