import {expect} from 'chai';
import { ToastService } from '@services/index';
import { take, pairwise } from 'rxjs/operators';
import { ToastType } from '@models/index';

describe('ToastService', () => {
    let toastService: ToastService;

    describe('Toasts', () => {

        beforeEach(()=> {
            toastService = new ToastService();
        });

        it('should publish a toast with minimal config', (done) => {
            toastService.observeToasts()
            .pipe(
                take(1)
            )
            .subscribe(
                t => {
                    expect(t).to.not.be.null;
                    expect(t).to.not.be.undefined;
                    expect(t.type).to.equal(ToastType.Info);
                    expect(t.message).to.equal('Testing');
                    expect(t.id).to.not.be.null;
                    expect(t.id).to.not.be.undefined;
                    done();
                },
                err => {
                    done(err);
                }
            );

            toastService.toast(ToastType.Info, 'Testing');
        });

        it('should publish a toast with title', (done) => {
            toastService.observeToasts()
            .pipe(
                take(1)
            )
            .subscribe(
                t => {
                    expect(t).to.not.be.null;
                    expect(t).to.not.be.undefined;
                    expect(t.type).to.equal(ToastType.Success);
                    expect(t.message).to.equal('Testing');
                    expect(t.title).to.equal('Title');
                    expect(t.id).to.not.be.null;
                    expect(t.id).to.not.be.undefined;
                    done();
                },
                err => {
                    done(err);
                }
            );

            toastService.toast(ToastType.Success, 'Testing', 'Title');
        });

        it('should publish a toast with title and options', (done) => {
            toastService.observeToasts()
            .pipe(
                take(1)
            )
            .subscribe(
                t => {
                    expect(t).to.not.be.null;
                    expect(t).to.not.be.undefined;
                    expect(t.type).to.equal(ToastType.Warning);
                    expect(t.message).to.equal('Testing');
                    expect(t.title).to.equal('Title');
                    expect(t.expires.valueOf()).to.equal(100);
                    expect(t.id).to.not.be.null;
                    expect(t.id).to.not.be.undefined;
                    expect(t.dismissable).to.be.false;
                    done();
                },
                err => {
                    done(err);
                }
            );

            toastService.toast(ToastType.Warning, 'Testing', 'Title', {dismissable: false, expireTime: new Date(100)});
        });

        it('should publish a toast with options and no title', (done) => {
            toastService.observeToasts()
            .pipe(
                take(1)
            )
            .subscribe(
                t => {
                    expect(t).to.not.be.null;
                    expect(t).to.not.be.undefined;
                    expect(t.type).to.equal(ToastType.Error);
                    expect(t.message).to.equal('Testing');
                    expect(t.expires.valueOf()).to.equal(100);
                    expect(t.id).to.not.be.null;
                    expect(t.id).to.not.be.undefined;
                    expect(t.dismissable).to.be.false;
                    done();
                },
                err => {
                    done(err);
                }
            );

            toastService.toast(ToastType.Error, 'Testing', null, {dismissable: false, expireTime: new Date(100)});
        });

        it('should publish a warning without title', (done) => {
            toastService.observeToasts()
            .pipe(
                take(1)
            )
            .subscribe(
                t => {
                    expect(t).to.not.be.null;
                    expect(t).to.not.be.undefined;
                    expect(t.type).to.equal(ToastType.Warning);
                    expect(t.message).to.equal('Testing');
                    expect(t.id).to.not.be.null;
                    expect(t.id).to.not.be.undefined;
                    done();
                },
                err => {
                    done(err);
                }
            );

            toastService.warning('Testing');
        });

        it('should publish a warning with title', (done) => {
            toastService.observeToasts()
            .pipe(
                take(1)
            )
            .subscribe(
                t => {
                    expect(t).to.not.be.null;
                    expect(t).to.not.be.undefined;
                    expect(t.type).to.equal(ToastType.Warning);
                    expect(t.message).to.equal('Testing');
                    expect(t.title).to.equal('Title');
                    expect(t.id).to.not.be.null;
                    expect(t.id).to.not.be.undefined;
                    done();
                },
                err => {
                    done(err);
                }
            );

            toastService.warning('Testing', 'Title');
        });

        it('should publish a warning with title and options', (done) => {
            toastService.observeToasts()
            .pipe(
                take(1)
            )
            .subscribe(
                t => {
                    expect(t).to.not.be.null;
                    expect(t).to.not.be.undefined;
                    expect(t.type).to.equal(ToastType.Warning);
                    expect(t.message).to.equal('Testing');
                    expect(t.title).to.equal('Title');
                    expect(t.expires.valueOf()).to.equal(100);
                    expect(t.id).to.not.be.null;
                    expect(t.id).to.not.be.undefined;
                    expect(t.dismissable).to.be.false;
                    done();
                },
                err => {
                    done(err);
                }
            );

            toastService.warning('Testing', 'Title', {dismissable: false, expireTime: new Date(100)});
        });

        it('should publish a warning with options and no title', (done) => {
            toastService.observeToasts()
            .pipe(
                take(1)
            )
            .subscribe(
                t => {
                    expect(t).to.not.be.null;
                    expect(t).to.not.be.undefined;
                    expect(t.type).to.equal(ToastType.Warning);
                    expect(t.message).to.equal('Testing');
                    expect(t.expires.valueOf()).to.equal(100);
                    expect(t.id).to.not.be.null;
                    expect(t.id).to.not.be.undefined;
                    expect(t.dismissable).to.be.false;
                    done();
                },
                err => {
                    done(err);
                }
            );

            toastService.warning('Testing', null, {dismissable: false, expireTime: new Date(100)});
        });

        it('should publish an error without title', (done) => {
            toastService.observeToasts()
            .pipe(
                take(1)
            )
            .subscribe(
                t => {
                    expect(t).to.not.be.null;
                    expect(t).to.not.be.undefined;
                    expect(t.type).to.equal(ToastType.Error);
                    expect(t.message).to.equal('Testing');
                    expect(t.id).to.not.be.null;
                    expect(t.id).to.not.be.undefined;
                    done();
                },
                err => {
                    done(err);
                }
            );

            toastService.error('Testing');
        });

        it('should publish an error with title', (done) => {
            toastService.observeToasts()
            .pipe(
                take(1)
            )
            .subscribe(
                t => {
                    expect(t).to.not.be.null;
                    expect(t).to.not.be.undefined;
                    expect(t.type).to.equal(ToastType.Error);
                    expect(t.message).to.equal('Testing');
                    expect(t.title).to.equal('Title');
                    expect(t.id).to.not.be.null;
                    expect(t.id).to.not.be.undefined;
                    done();
                },
                err => {
                    done(err);
                }
            );

            toastService.error('Testing', 'Title');
        });

        it('should publish an error with title and options', (done) => {
            toastService.observeToasts()
            .pipe(
                take(1)
            )
            .subscribe(
                t => {
                    expect(t).to.not.be.null;
                    expect(t).to.not.be.undefined;
                    expect(t.type).to.equal(ToastType.Error);
                    expect(t.message).to.equal('Testing');
                    expect(t.title).to.equal('Title');
                    expect(t.expires.valueOf()).to.equal(100);
                    expect(t.id).to.not.be.null;
                    expect(t.id).to.not.be.undefined;
                    expect(t.dismissable).to.be.false;
                    done();
                },
                err => {
                    done(err);
                }
            );

            toastService.error('Testing', 'Title', {dismissable: false, expireTime: new Date(100)});
        });

        it('should publish an error with options and no title', (done) => {
            toastService.observeToasts()
            .pipe(
                take(1)
            )
            .subscribe(
                t => {
                    expect(t).to.not.be.null;
                    expect(t).to.not.be.undefined;
                    expect(t.type).to.equal(ToastType.Error);
                    expect(t.message).to.equal('Testing');
                    expect(t.expires.valueOf()).to.equal(100);
                    expect(t.id).to.not.be.null;
                    expect(t.id).to.not.be.undefined;
                    expect(t.dismissable).to.be.false;
                    done();
                },
                err => {
                    done(err);
                }
            );

            toastService.error('Testing', null, {dismissable: false, expireTime: new Date(100)});
        });

        it('should generate consistent Ids', (done)=> {
            toastService.observeToasts()
            .pipe(
                pairwise(),
                take(1)
            )
            .subscribe(
                ([t1, t2]) => {
                    expect(t1).to.not.be.null;
                    expect(t1).to.not.be.undefined;
                    expect(t2).to.not.be.null;
                    expect(t2).to.not.be.undefined;
                    expect(t1.id).to.equal(t2.id);
                    done();
                },
                err => {
                    done(err);
                }
            );
            toastService.toast(ToastType.Info, 'ConsistentId');
            toastService.toast(ToastType.Info, 'ConsistentId');
        });
    });
});
