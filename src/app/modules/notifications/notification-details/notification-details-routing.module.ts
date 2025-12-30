import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationDetailsPage } from './notification-details.page';

const routes: Routes = [
  {
    path: '',
    component: NotificationDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationDetailsPageRoutingModule {}
