import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MembershipsListPage } from './memberships-list.page';

const routes: Routes = [
  {
    path: '',
    component: MembershipsListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MembershipsListPageRoutingModule {}
