import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrainingCalendarResultPage } from './training-calendar-result.page';

const routes: Routes = [
  {
    path: '',
    component: TrainingCalendarResultPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingCalendarResultPageRoutingModule {}
