import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MembershipsStatusesPageRoutingModule } from './memberships-statuses-routing.module';
import { MembershipsStatusesPage } from './memberships-statuses.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MembershipsStatusesPageRoutingModule,
    TranslateModule
  ],
  declarations: [MembershipsStatusesPage]
})
export class MembershipsStatusesPageModule {}
