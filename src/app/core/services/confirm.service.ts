import {inject, Injectable} from '@angular/core';
import { AlertController } from '@ionic/angular';
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  private alertCtrl = inject(AlertController);
  private translate = inject(TranslateService);

  constructor() {}

  async confirmDelete(message: string = this.translate.instant('confirm_delete_confirm')): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('confirm_delete'),
      message,
      cssClass: 'custom-alert-wrapper',
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          cssClass: 'okay-button-color'
        },
        {
          text: this.translate.instant('ok'),
          role: 'confirm',
          cssClass: 'cancel-button-color'
        }
      ]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  async confirmLogount(): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('logout'),
      message: this.translate.instant('confirm_logout'),
      cssClass: 'custom-alert-wrapper',
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          cssClass: 'okay-button-color'
        },
        {
          text: this.translate.instant('ok'),
          role: 'confirm',
          cssClass: 'cancel-button-color'
        }
      ]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }
}
