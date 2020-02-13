import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '@modules/shared';
import {LoginComponent} from '@components/login/component';

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(
            [
                {path: '', pathMatch: 'full', component: LoginComponent},
            ]
        )
    ],
    declarations: [
        LoginComponent
    ]
})
export class LoginLazyModule {}
