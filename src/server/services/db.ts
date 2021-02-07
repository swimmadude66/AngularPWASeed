import {createPool, PoolConfig, Pool, Connection, escape as mysqlEscape} from 'mysql';
import {Observable, throwError, of} from 'rxjs';
import {switchMap, catchError, tap} from 'rxjs/operators';
import {DBResponse} from '../models/db';

const NUMPERPAGE = 50;

export class DatabaseService {
    private _pool: Pool;

    constructor(config?: PoolConfig) {
        let poolconfig = Object.assign({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_DATABASE || 'demoDb',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'admin',
            charset: 'utf8mb4' // allow emojis
        }, config || {});

        this._pool = createPool(poolconfig);
    }

    query<T>(q: string, params?: any[]): Observable<DBResponse<T>> {
        return this.getConnection()
        .pipe(
            switchMap(
                conn => this.connectionQuery<T>(conn, q, params)
                .pipe(
                    tap(_ => conn.release()),
                    catchError(err => {
                        conn.release();
                        return throwError(err);
                    })
                )
            )
        );
    }

    getConnection(): Observable<Connection> {
        return Observable.create(observer => {
            this._pool.getConnection((err, conn) => {
                if (err) {
                    if (conn && conn.release) {
                        conn.release();
                    }
                    return observer.error(err);
                } else {
                    observer.next(conn);
                    return observer.complete(conn);
                }
            });
        });
    }

    connectionQuery<T>(conn: Connection, query: string, params?: any[]): Observable<DBResponse<T>> {
        return Observable.create(observer => {
            conn.query(query, params || [], (error, result) => {
                if (error) {
                    return observer.error(error);
                }
                observer.next(result);
                observer.complete(result); // rebroadcast on complete for async await
            });
        });
    }

    beginTransaction(conn?: Connection): Observable<Connection> {
        const connSource = conn ? of(conn) : this.getConnection();
        return connSource.pipe(
            switchMap(connection => this._beginTransaction(connection))
        );
    }


    connectionCommit(conn: Connection): Observable<Connection> {
        return Observable.create(obs => {
            conn.commit((err) => {
                if (err) {
                    return obs.error(err);
                }
                obs.next(conn);
                return obs.complete(conn);
            });
        });
    }

    connectionRollback(conn: Connection): Observable<Connection> {
        return Observable.create(obs => {
            conn.rollback(() => {
                obs.next(conn);
                return obs.complete(conn);
            });
        });
    }

    escape(value) {
        return mysqlEscape(value);
    }

    cleanup(): Observable<any> {
        return new Observable(obs => {
            this._pool.end(() => {
                obs.next('mysql pool closed');
                obs.complete();
            });
        });
    }

    private _beginTransaction(conn: Connection): Observable<Connection> {
        return Observable.create(obs => {
            conn.beginTransaction((err) => {
                if (err) {
                    return obs.error(err);
                }
                obs.next(conn);
                return obs.complete(conn);
            });
        });
    }
}
