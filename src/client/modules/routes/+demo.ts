import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '@modules/shared';
import {DemoComponent} from '@components/demo/component';

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(
            [
                {path: '', pathMatch: 'full', component: DemoComponent},
            ]
        )
    ],
    declarations: [
        DemoComponent
    ]
})
export class DemoLazyModule {}
