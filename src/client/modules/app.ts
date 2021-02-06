import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {BrowserModule, BrowserTransferStateModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {SharedModule} from '@modules/shared';
import {IsLoggedInGuard, NotLoggedInGuard} from '@guards'
import { HttpConnectionInterceptor } from '@services/connection/interceptor';
import {AppComponent} from '@components/app/component';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        BrowserModule.withServerTransition({appId: 'demowebapp'}),
        BrowserAnimationsModule,
        SharedModule,
        BrowserTransferStateModule,
        RouterModule.forRoot(
            [
                {path: 'login', canLoad: [NotLoggedInGuard], canActivateChild: [NotLoggedInGuard], loadChildren: () => import('./routes/+login').then(m => m.LoginLazyModule)},
                {path: 'signup', canLoad: [NotLoggedInGuard], canActivateChild: [NotLoggedInGuard], loadChildren: () => import('./routes/+signup').then(m => m.SignupLazyModule)},
                {path: '', canLoad: [IsLoggedInGuard], canActivateChild: [IsLoggedInGuard], loadChildren: () => import('./routes/+demo').then(m => m.DemoLazyModule)},
            ]
        )
    ],
    declarations: [
        AppComponent,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpConnectionInterceptor,
            multi: true,
        }
    ]
})
export class AppModule {}
