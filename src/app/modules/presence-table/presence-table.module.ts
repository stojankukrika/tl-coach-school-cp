import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PresenceTablePageRoutingModule } from './presence-table-routing.module';
import { PresenceTablePage } from './presence-table.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PresenceTablePageRoutingModule,
    TranslateModule
  ],
  declarations: [PresenceTablePage]
})
export class PresenceTablePageModule {}
