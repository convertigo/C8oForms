import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
/**
 * Service for handling common actions such as opening modals, showing toasts, scanning QR codes, taking pictures, and showing/hiding loading spinners.
 */
export class ActionsService {

  /**
   * Private variable to hold the loading spinner instance.
   */
  private _loading: any;

  /**
   * Boolean indicating whether the app is running on the web platform.
   */
  public isWeb: boolean = this._isWeb();

  /**
   * Creates an instance of ActionsService.
   * @param modalCtrl The modal controller to use for opening modals.
   * @param toastController The toast controller to use for showing toasts.
   * @param loadingCtrl The loading controller to use for showing/hiding loading spinners.
   */
  constructor(private modalCtrl: ModalController, private toastController: ToastController, private loadingCtrl: LoadingController, private alertController: AlertController) { }

  /**
   * Opens a modal with the specified component and options.
   * @param component The component to use for the modal.
   * @param opts Optional options to pass to the modal.
   * @returns A promise that resolves with the data and role of the modal on dismissal.
   */
  public async openModal(component: any, opts?: any): Promise<any> {
    const modal = await this.modalCtrl.create({
      component: component,
      ...opts,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    return { data, role };
  }

  /**
   * Shows a toast with the specified options.
   * @param opts The options to use for the toast.
   */
  public async toast(opts: any) {
    const toast = await this.toastController.create(opts);
    await toast.present();
  }


  /**
   * Determines whether the app is running on the web platform.
   * @returns A boolean indicating whether the app is running on the web platform.
   */
  public _isWeb(): boolean {
    if (!window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      // Code pour les appareils non-mobiles ici
      return true;
    } else {
      return false;
    }
  }

  /**
   * Shows a loading spinner with the specified options.
   * @param spinner The type of spinner to show.
   * @param message Optional message to display with the spinner.
   */
  public async showLoading(spinner: "bubbles" | "circles" | "circular" | "crescent" | "dots" | "lines" | "lines-sharp" | "lines-sharp-small" | "lines-small" | null | undefined = "bubbles", message?: string) {
    if (!this._loading) {
      this._loading = await this.loadingCtrl.create({
        message,
        spinner
      });
      await this._loading.present();
    }
  }

  /**
   * Hides the currently displayed loading spinner.
   */
  public async hideLoading() {
    if (this._loading) {
      await this._loading.dismiss();
      this._loading = null;
    }
  }

  public async alert(opts: any) {
    const alert = await this.alertController.create(opts);
    await alert.present();
    return await alert.onDidDismiss();
  }
}
