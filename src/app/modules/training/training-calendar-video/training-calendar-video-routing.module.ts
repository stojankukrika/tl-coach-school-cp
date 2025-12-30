import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrainingCalendarVideoPage } from './training-calendar-video.page';

const routes: Routes = [
  {
    path: '',
    component: TrainingCalendarVideoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingCalendarVideoPageRoutingModule {}
