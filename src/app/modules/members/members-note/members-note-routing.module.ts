import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MembersNotePage } from './members-note.page';

const routes: Routes = [
  {
    path: '',
    component: MembersNotePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MembersNotePageRoutingModule {}
