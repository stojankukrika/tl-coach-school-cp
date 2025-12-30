import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TrainingCalendarResultPageRoutingModule } from './training-calendar-result-routing.module';
import { TrainingCalendarResultPage } from './training-calendar-result.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrainingCalendarResultPageRoutingModule,
    TranslateModule
  ],
  declarations: [TrainingCalendarResultPage]
})
export class TrainingCalendarResultPageModule {}
