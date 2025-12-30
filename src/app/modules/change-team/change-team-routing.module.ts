import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangeTeamPage } from './change-team.page';

const routes: Routes = [
  {
    path: '',
    component: ChangeTeamPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangeTeamPageRoutingModule {}
