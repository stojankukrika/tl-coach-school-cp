import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileAvatarPage } from './profile-avatar.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileAvatarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileAvatarPageRoutingModule {}
