import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FormMembershipPaymentPageRoutingModule } from './form-membership-payment-routing.module';
import { FormMembershipPaymentPage } from './form-membership-payment.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormMembershipPaymentPageRoutingModule,
    TranslateModule
  ],
  declarations: [FormMembershipPaymentPage]
})
export class FormMembershipPaymentPageModule {}
