import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MembersPresencePage } from './members-presence.page';

const routes: Routes = [
  {
    path: '',
    component: MembersPresencePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MembersPresencePageRoutingModule {}
