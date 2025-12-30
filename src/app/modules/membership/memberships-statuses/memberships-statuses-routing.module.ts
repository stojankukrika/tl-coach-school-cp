import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MembershipsStatusesPage } from './memberships-statuses.page';

const routes: Routes = [
  {
    path: '',
    component: MembershipsStatusesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MembershipsStatusesPageRoutingModule {}
