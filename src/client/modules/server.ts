import {NgModule} from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {ServerModule, ServerTransferStateModule} from '@angular/platform-server';
import {ModuleMapLoaderModule} from '@nguniversal/module-map-ngfactory-loader';

import {AppModule} from './app';
import {AppComponent} from '@components/app/component';
import { ServerSideRequestInterceptor } from '@services/ssr';

@NgModule({
  imports: [
    // The AppServerModule should import your AppModule followed
    // by the ServerModule from @angular/platform-server.
    AppModule,
    ServerModule,
    ServerTransferStateModule,
    ModuleMapLoaderModule // <-- *Important* to have lazy-loaded routes work
  ],
  // Since the bootstrapped component is not inherited from your
  // imported AppModule, it needs to be repeated here.
  bootstrap: [AppComponent],
  providers: [
    {
        provide: HTTP_INTERCEPTORS,
        useClass: ServerSideRequestInterceptor,
        multi: true,
    },
  ]
})
export class AppServerModule {}
