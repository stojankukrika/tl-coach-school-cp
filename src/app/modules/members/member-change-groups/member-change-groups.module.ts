import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MemberChangeGroupsPageRoutingModule } from './member-change-groups-routing.module';
import { MemberChangeGroupsPage } from './member-change-groups.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemberChangeGroupsPageRoutingModule,
    TranslateModule
  ],
  declarations: [MemberChangeGroupsPage]
})
export class MemberChangeGroupsPageModule {}
