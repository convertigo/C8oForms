import { NgModule, ErrorHandler } 							from '@angular/core';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } 	from '@angular/common/http';
import { FormsModule, ReactiveFormsModule }   				from '@angular/forms';
import { BrowserModule } 									from '@angular/platform-browser';
import { BrowserAnimationsModule }                          from '@angular/platform-browser/animations';
import { RouteReuseStrategy } 								from '@angular/router';
import { ServiceWorkerModule }                              from '@angular/service-worker';

import { TranslateModule, TranslateLoader } 				from '@ngx-translate/core';
import { TranslateHttpLoader } 								from '@ngx-translate/http-loader';

import { IonicModule, IonicRouteStrategy } 					from '@ionic/angular';
import { SplashScreen } 									from '@ionic-native/splash-screen/ngx';
import { StatusBar } 										from '@ionic-native/status-bar/ngx';

import { C8o, HttpXsrfInterceptor }                         from "c8osdkangular";
import { C8oRouter } 			                            from 'c8ocaf';
import { environment } 										from '../environments/environment';
import { ActionBeans }                                      from './services/actionbeans.service';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {APP_BASE_HREF} from '@angular/common';
/*=c8o_ModuleTsImports*/

/**
 * Customize the ngx-translate loader for assets/i18n
 */
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [/*Begin_c8o_NgDeclarations*/
  	AppComponent,
  /*End_c8o_NgDeclarations*/],
  entryComponents: [/*Begin_c8o_NgComponents*/
  /*End_c8o_NgComponents*/],
  imports: [/*Begin_c8o_NgModules*/
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
	FormsModule,
	ReactiveFormsModule,
	TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
        }
	}),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: /*=c8o_ServiceWorkerEnabled*/,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerImmediately'
    }),
	IonicModule.forRoot(), 
	AppRoutingModule,
  /*End_c8o_NgModules*/],
  providers: [
	{provide: APP_BASE_HREF, useValue:window.location.href.indexOf("DisplayObjects") != -1 ? window.location.href.indexOf("DisplayObjects/mobile") != -1 ? "/convertigo/projects/C8Oforms/DisplayObjects/mobile/" : "/" + window.location.href.split("/").slice(window.location.href.split("/").indexOf("convertigo"),window.location.href.split("/").indexOf("DisplayObjects") +3).join("/")+"/": "/"},
	/*Begin_c8o_NgProviders*/
    StatusBar,
    SplashScreen,
    C8o,
    C8oRouter,
//    ActionBeans,
    {
        provide: HTTP_INTERCEPTORS,
        useClass: HttpXsrfInterceptor,
        multi: true
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  /*End_c8o_NgProviders*/],
  bootstrap: [AppComponent]
})
export class AppModule {}