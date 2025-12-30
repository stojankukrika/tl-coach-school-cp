import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormMembershipPaymentPage } from './form-membership-payment.page';

const routes: Routes = [
  {
    path: '',
    component: FormMembershipPaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormMembershipPaymentPageRoutingModule {}
