import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NotificationDetailsPageRoutingModule } from './notification-details-routing.module';
import { NotificationDetailsPage } from './notification-details.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationDetailsPageRoutingModule,
    TranslateModule
  ],
  declarations: [NotificationDetailsPage]
})
export class NotificationDetailsPageModule {}
