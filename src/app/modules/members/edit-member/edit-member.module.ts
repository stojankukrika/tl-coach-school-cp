import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditMemberPageRoutingModule } from './edit-member-routing.module';
import { EditMemberPage } from './edit-member.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditMemberPageRoutingModule,
    TranslateModule
  ],
  declarations: [EditMemberPage]
})
export class EditMemberPageModule {}
