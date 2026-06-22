import { Injectable, Injector } from '@angular/core';
import { AngularDelegate } from '@ionic/angular/common';
import { ModalController, PopoverController } from '@ionic/angular/standalone';
import { NavParams } from './nav-params';

@Injectable({ providedIn: 'root' })
export class NavParamsWrapperService {

  constructor(
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private angularDelegate: AngularDelegate
  ) {}

  public apply() {
	this.patchAngularOverlayDelegate();
  }

  private patchAngularOverlayDelegate() {
	const angularDelegateAny = this.angularDelegate as any;
	if (angularDelegateAny.__c8oNavParamsPatched) return;
	
	const originalCreate = this.angularDelegate.create.bind(this.angularDelegate);
	angularDelegateAny.create = (...args: any[]) => {
	  const delegate: any = originalCreate(...args);
	  if (delegate?.__c8oNavParamsPatched) return delegate;
	  
	  const originalAttachViewToDom = delegate.attachViewToDom.bind(delegate);
	  const baseInjector: Injector = delegate.injector;
	  
	  delegate.attachViewToDom = (container: any, component: any, params?: any, cssClasses?: string[]) => {
		const overlayNavParams = new NavParams(undefined as any);
		overlayNavParams._prime(params || {});
		
		delegate.injector = Injector.create({
		  providers: [{ provide: NavParams, useValue: overlayNavParams }],
		  parent: baseInjector
		});
		
		try {
		  const result = originalAttachViewToDom(container, component, params, cssClasses);
		  return Promise.resolve(result).finally(() => {
			delegate.injector = baseInjector;
		  });
		} catch (e) {
		  delegate.injector = baseInjector;
		  throw e;
		}
	  };
	  
	  delegate.__c8oNavParamsPatched = true;
	  return delegate;
	};
	
	angularDelegateAny.__c8oNavParamsPatched = true;
  }
      
  public getModalController() : ModalController {
  	return this.modalCtrl;
  }

  public getPopoverController() : PopoverController {
  	return this.popoverCtrl;
  }
  
}
