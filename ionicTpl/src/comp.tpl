import { Component, Input , Output, EventEmitter, OnInit, OnDestroy, ElementRef }	from '@angular/core';
import { ChangeDetectorRef, ChangeDetectionStrategy, InjectionToken, Injector }		from "@angular/core";
import { Type, OnChanges, SimpleChanges } 											from "@angular/core";
import { Router, ActivatedRoute } 													from '@angular/router';
import { DomSanitizer }                 											from '@angular/platform-browser';
import { NavParams, NavController, LoadingController, MenuController, Platform }	from '@ionic/angular';
import { AlertController, ActionSheetController, ModalController }					from '@ionic/angular';
import { AnimationController, PopoverController, ToastController }					from '@ionic/angular';
import { C8oPage, C8oPageBase, C8oRouter, C8oCafUtils }                      		from 'c8ocaf';
import { C8oNetworkStatus }                                 						from 'c8osdkangular';
import { TranslateService }                                 						from '@ngx-translate/core';
import { ActionBeans } 																from '../../services/actionbeans.service';
import { Events } 																	from '../../services/events.service';

/*
	You can customize your page class by writing code between the :
   		Begin_c8o_XXXX and
   		End_c8o_XXXX
   	Comments.
   	Any code placed outside these these comments will be lost when the application is generated
*/
/*=c8o_CompImports*/

/*Begin_c8o_CompImport*/
/*End_c8o_CompImport*/

/*=c8o_CompInterfaces*/

@Component({selector: /*=c8o_CompSelector*/, templateUrl: /*=c8o_CompTplUrl*/, styleUrls: [/*=c8o_CompStyleUrls*/], changeDetection: /*=c8o_CompChangeDetection*/})
export class /*=c8o_CompName*/ extends C8oPageBase implements OnInit, OnDestroy, OnChanges {
	@Input() owner : C8oPageBase = undefined;
	/*=c8o_CompDeclarations*/

	public elRef: ElementRef;
	public events : Events;
	public subscriptions = {};
	public actionBeans: ActionBeans;
	public JSON: JSON = window.JSON;
	public pageOwner: any;
	public static nameStatic: string = "/*=c8o_CompName*/";
	/*Begin_c8o_CompDeclaration*/
	/*End_c8o_CompDeclaration*/

	constructor(private elementRef: ElementRef, injector: Injector, routerProvider: C8oRouter, loadingCtrl: LoadingController, ref: ChangeDetectorRef, public translate: TranslateService){
		super(injector, routerProvider, loadingCtrl, ref);
		this.elRef = elementRef;
		//this.events = this.getInstance(Events);
		//this.actionBeans = this.getInstance(ActionBeans);
		
		/*=c8o_CompConstructors*/
		
		/*Begin_c8o_CompConstructor*/
		/*End_c8o_CompConstructor*/
		
    }
	
	ngOnInit() {
		this.events = this.owner ? this.owner["events"] : this.getInstance(Events);
		this.actionBeans = this.owner ? this.owner["actionBeans"] : this.getInstance(ActionBeans);
		
		/*=c8o_CompInitializations*/
		
		/*Begin_c8o_CompInitialization*/
		/*End_c8o_CompInitialization*/
	}

	ngOnDestroy() {
		/*=c8o_CompFinallizations*/
		
		/*Begin_c8o_CompFinalization*/
		/*End_c8o_CompFinalization*/
		
		this.subscriptions = {};
		super.ngOnDestroy();
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if(changes.owner != undefined && changes.owner.previousValue == undefined){
			this.pageOwner = this.findPageOwner();
		}
		/*Begin_c8o_CompChanges*/
		/*End_c8o_CompChanges*/
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

	public findPageOwner(): C8oPageBase{
	    let founded = false;
	    let currentOwner = this.owner;
	    while(founded == false){
	      if(currentOwner["owner"] != undefined){
	        // continue to search
	        currentOwner = currentOwner["owner"];
	      }
	      else{
	        founded = true;
	      }
	    } 
	    return currentOwner;
	}
		
	/*Begin_c8o_CompFunction*/
	/*End_c8o_CompFunction*/
	
	/*=c8o_CompFunctions*/
}
