import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MembersPresencePageRoutingModule } from './members-presence-routing.module';
import { MembersPresencePage } from './members-presence.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MembersPresencePageRoutingModule,
    TranslateModule
  ],
  declarations: [MembersPresencePage]
})
export class MembersPresencePageModule {}
