import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroupMembershipPage } from './group-membership.page';

const routes: Routes = [
  {
    path: '',
    component: GroupMembershipPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupMembershipPageRoutingModule {}
