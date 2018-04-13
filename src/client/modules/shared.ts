import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {InputGroupComponent} from '@components/inputgroup/component';

@NgModule({
    imports:[
        RouterModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
    ],
    declarations: [
        InputGroupComponent,
    ],
    exports: [
        RouterModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        InputGroupComponent,
    ]
})
export class SharedModule {}
