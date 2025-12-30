import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrainingCalendarsPage } from './training-calendars.page';

const routes: Routes = [
  {
    path: '',
    component: TrainingCalendarsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingCalendarsPageRoutingModule {}
