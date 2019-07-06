import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {BrowserModule, BrowserTransferStateModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '@modules/shared';
import {AppComponent} from '@components/app/component';
import {IsLoggedInGuard, NotLoggedInGuard} from '@guards/index'

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
                {path: 'login', canLoad: [NotLoggedInGuard], canActivateChild: [NotLoggedInGuard], loadChildren: './routes/+login#LoginLazyModule'},
                {path: 'signup', canLoad: [NotLoggedInGuard], canActivateChild: [NotLoggedInGuard], loadChildren: './routes/+signup#SignupLazyModule'},
                {path: '', canLoad: [IsLoggedInGuard], canActivateChild: [IsLoggedInGuard], loadChildren: './routes/+demo#DemoLazyModule'},
            ]
        )
    ],
    declarations: [
        AppComponent,
    ]
})
export class AppModule {}
