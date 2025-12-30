import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TrainingCalendarsPageRoutingModule } from './training-calendars-routing.module';
import { TrainingCalendarsPage } from './training-calendars.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrainingCalendarsPageRoutingModule,
    TranslateModule
  ],
  declarations: [TrainingCalendarsPage]
})
export class TrainingCalendarsPageModule {}
