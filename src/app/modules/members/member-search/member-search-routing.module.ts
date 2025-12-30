import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemberSearchPage } from './member-search.page';

const routes: Routes = [
  {
    path: '',
    component: MemberSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemberSearchPageRoutingModule {}
