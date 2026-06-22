import { Component, Input, CUSTOM_ELEMENTS_SCHEMA }										from '@angular/core';
import { Router, ActivatedRoute }														from '@angular/router';
import { DomSanitizer }                 												from '@angular/platform-browser';
import { NavController, LoadingController, MenuController, Platform}					from '@ionic/angular/standalone';
import { AlertController, ActionSheetController, ModalController }						from '@ionic/angular/standalone';
import { AnimationController, PopoverController, ToastController }						from '@ionic/angular/standalone';
import { C8oPage, C8oPageBase, C8oRouter, C8oCafUtils }                      			from 'c8ocaf';
import { C8oNetworkStatus }                                 							from 'c8osdkangular';
import { ChangeDetectorRef, ChangeDetectionStrategy, InjectionToken, Injector, Type}	from "@angular/core";
import { TranslateService }                                 							from '@ngx-translate/core';
import { ActionBeans } 																	from '../../services/actionbeans.service';
import { Events } 																		from '../../services/events.service';
import { NavParams }																	from '../../patch/nav-params';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

/*
	You can customize your page class by writing code between the :
   		Begin_c8o_XXXX and
   		End_c8o_XXXX
   	Comments.
   	Any code placed outside these these comments will be lost when the application is generated
*/
/*=c8o_PageImports*/

/*Begin_c8o_PageImport*/
/*End_c8o_PageImport*/

@Component({
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		TranslateModule,
		
		/*c8o_StandAloneNgModules*/
	],
	providers: [
		/*Begin_c8o_NgProviders*/
		/*End_c8o_NgProviders*/
	],
	selector: /*=c8o_PageSelector*/,
	templateUrl: /*=c8o_PageTplUrl*/,
	styleUrls: [/*=c8o_PageStyleUrls*/],
	schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
	changeDetection: /*=c8o_PageChangeDetection*/
})

export class /*=c8o_PageName*/  extends C8oPage {
	/*=c8o_PageDeclarations*/

	public events : Events;
	public subscriptions = {};
	public actionBeans: ActionBeans;
	public JSON: JSON = window.JSON;
	public static nameStatic: string = "/*=c8o_PageName*/";
	/*Begin_c8o_PageDeclaration*/
	/*End_c8o_PageDeclaration*/

	constructor(public navParams : NavParams, routerProvider: C8oRouter, private route: ActivatedRoute, private angularRouter: Router, loadingCtrl: LoadingController, sanitizer: DomSanitizer, ref: ChangeDetectorRef, injector: Injector, menuCtrl: MenuController, public translate: TranslateService){
		super(routerProvider, loadingCtrl, sanitizer, ref, injector, menuCtrl);
		this.events = this.getInstance(Events);
		this.actionBeans = this.getInstance(ActionBeans);

		this.navParams = new NavParams(this.route, this.navParams.data);
		
		/*=c8o_PageConstructors*/
		
		/*Begin_c8o_PageConstructor*/
		/*End_c8o_PageConstructor*/
		
    }
	
	instance() {
		return this;
	}
	
	public merge(firstObj: Object, secondObj): Object{
	    return Object.assign(firstObj, secondObj);
	}
	
	public log(val) {
	    console.log(val);
	}

	public getPageName() {
		return "/*=c8o_PageName*/";		
	}
	
	public getAppPages() {
		//Array<{title: string, titleKey: string, url: string, icon: string, iconPos: string, name: string, includedInAutoMenu?: boolean}>
		return this.routerProvider.pagesArray;
	}
	
	public getPageInfos() {
		for (let i=0; i<this.routerProvider.pagesArray.length; i++) {
			let info = this.routerProvider.pagesArray[i];
			if (this.getPageName() == info["name"]) {
				return info;
			}
		}
		return {name: this.getPageName()};
	}
	
	public navigate(url: string, data: any) {
	    this.angularRouter.navigate([url], { queryParams: data });
	}
	
	public navigateByUrl(url: string){
	    this.angularRouter.navigateByUrl(url);
	}
	
	ngOnInit() {
		/*Begin_c8o_PageInitialization*/
		/*End_c8o_PageInitialization*/
		
		this.onInit();
	}

	ngAfterViewInit() {
		this.afterViewInit();
		
		/*Begin_c8o_PageAfterViewInit*/
		/*End_c8o_PageAfterViewInit*/		
	}

	ngOnDestroy() {
		this.onDestroy();
		
		/*Begin_c8o_PageFinalization*/
		/*End_c8o_PageFinalization*/
		
		this.subscriptions = {};
		super.ngOnDestroy();
	}
	
	/*Begin_c8o_PageFunction*/
	/*End_c8o_PageFunction*/
	
	/*=c8o_PageFunctions*/
}
