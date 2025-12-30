import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TrainingCalendarVideoPageRoutingModule } from './training-calendar-video-routing.module';
import { TrainingCalendarVideoPage } from './training-calendar-video.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrainingCalendarVideoPageRoutingModule,
    TranslateModule
  ],
  declarations: [TrainingCalendarVideoPage]
})
export class TrainingCalendarVideoPageModule {}
