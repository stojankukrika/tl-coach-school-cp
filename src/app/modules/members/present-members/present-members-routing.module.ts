import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PresentMembersPage } from './present-members.page';

const routes: Routes = [
  {
    path: '',
    component: PresentMembersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PresentMembersPageRoutingModule {}
