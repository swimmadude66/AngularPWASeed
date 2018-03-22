import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@NgModule({
    imports:[
        RouterModule,
        CommonModule,
        FormsModule,
    ],
    exports: [
        RouterModule,
        CommonModule,
        FormsModule,
    ]
})
export class SharedModule {}
