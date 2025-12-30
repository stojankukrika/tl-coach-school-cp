import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemberPhotoPage } from './member-photo.page';

const routes: Routes = [
  {
    path: '',
    component: MemberPhotoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemberPhotoPageRoutingModule {}
