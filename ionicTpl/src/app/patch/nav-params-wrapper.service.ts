import { Injectable } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular/standalone';
import { NavParamsHostComponent } from './nav-params-host.component';

@Injectable({ providedIn: 'root' })
export class NavParamsWrapperService {

  constructor(
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController
  ) {}

  public apply() {
	
    // Patch ModalController
    const origModalCreate = this.modalCtrl.create.bind(this.modalCtrl);
    (this.modalCtrl as any).create = (opts: any) => {
      const wrappedOpts = this.wrapOpts(opts);
      const modalPromise = origModalCreate(wrappedOpts);

	  modalPromise.then((modal: any) => {
	    modal.onWillDismiss?.().then(() => this.forwardHook(modal, 'ionViewWillLeave'));
	    modal.onDidDismiss?.().then(() => this.forwardHook(modal, 'ionViewDidLeave'));
	  });

	  return modalPromise;
    };

    // Patch PopoverController
    const origPopoverCreate = this.popoverCtrl.create.bind(this.popoverCtrl);
    (this.popoverCtrl as any).create = (opts: any) => {
      const wrappedOpts = this.wrapOpts(opts);
      const popoverPromise = origPopoverCreate(wrappedOpts);

	  popoverPromise.then((popover: any) => {
	    popover.onWillDismiss?.().then(() => this.forwardHook(popover, 'ionViewWillLeave'));
	    popover.onDidDismiss?.().then(() => this.forwardHook(popover, 'ionViewDidLeave'));
	  });

	  return popoverPromise;
    };
  }

  private wrapOpts(opts: any) {
    if (!opts || !opts.component || opts.component === NavParamsHostComponent) return opts;

    const originalComponent = opts.component;
    const props = opts.componentProps || {};

    return {
      ...opts,
      component: NavParamsHostComponent,
      componentProps: {
        __wrapped: originalComponent,
        __forwardProps: props,
        __navData: props
      }
    };
  }

  private forwardHook(overlay: any, event: any) {
    const hostInstance = overlay?.el?.__navHostInstance;
    hostInstance?.triggerEvent?.(event);
  }
      
  public getModalController() : ModalController {
  	return this.modalCtrl;
  }

  public getPopoverController() : PopoverController {
  	return this.popoverCtrl;
  }
  
}
