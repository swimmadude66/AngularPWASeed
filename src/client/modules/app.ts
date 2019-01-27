import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {BrowserModule, BrowserTransferStateModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TransferHttpCacheModule} from '@nguniversal/common';
import {SharedModule} from '@modules/shared';
import {AppComponent, LoginComponent} from '@components/index';
import {IsLoggedInGuard, NotLoggedInGuard} from '@guards/index'

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        BrowserModule.withServerTransition({appId: 'demowebapp'}),
        BrowserAnimationsModule,
        SharedModule,
        TransferHttpCacheModule,
        BrowserTransferStateModule,
        RouterModule.forRoot(
            [
                {path: 'login', canActivate: [NotLoggedInGuard], component: LoginComponent},
                {path: 'signup', canLoad: [NotLoggedInGuard], canActivateChild: [NotLoggedInGuard], loadChildren: './routes/+signup#SignupLazyModule'},
                {path: '', canLoad: [IsLoggedInGuard], canActivateChild: [IsLoggedInGuard], loadChildren: './routes/+demo#DemoLazyModule'},
            ]
        )
    ],
    declarations: [
        AppComponent,
        LoginComponent
    ]
})
export class AppModule {}
