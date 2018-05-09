import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {SharedModule} from '@modules/shared';
import {AppComponent, LoginComponent} from '@components/';
import {IsLoggedInGuard, NotLoggedInGuard} from '@guards/'

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        SharedModule,
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
