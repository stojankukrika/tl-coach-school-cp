import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GroupMembershipPageRoutingModule } from './group-membership-routing.module';
import { GroupMembershipPage } from './group-membership.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroupMembershipPageRoutingModule,
    TranslateModule
  ],
  declarations: [GroupMembershipPage]
})
export class GroupMembershipPageModule {}
