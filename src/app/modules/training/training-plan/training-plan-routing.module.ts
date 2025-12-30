import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrainingPlanPage } from './training-plan.page';

const routes: Routes = [
  {
    path: '',
    component: TrainingPlanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingPlanPageRoutingModule {}
