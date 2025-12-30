import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PresentMembersPageRoutingModule } from './present-members-routing.module';
import { PresentMembersPage } from './present-members.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PresentMembersPageRoutingModule,
    TranslateModule
  ],
  declarations: [PresentMembersPage]
})
export class PresentMembersPageModule {}
