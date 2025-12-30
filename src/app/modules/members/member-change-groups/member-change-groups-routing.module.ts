import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemberChangeGroupsPage } from './member-change-groups.page';

const routes: Routes = [
  {
    path: '',
    component: MemberChangeGroupsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemberChangeGroupsPageRoutingModule {}
