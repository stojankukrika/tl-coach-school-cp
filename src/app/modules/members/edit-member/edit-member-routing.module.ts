import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditMemberPage } from './edit-member.page';

const routes: Routes = [
  {
    path: '',
    component: EditMemberPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditMemberPageRoutingModule {}
