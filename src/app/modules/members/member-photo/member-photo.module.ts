import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MemberPhotoPageRoutingModule } from './member-photo-routing.module';
import { MemberPhotoPage } from './member-photo.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemberPhotoPageRoutingModule,
    TranslateModule
  ],
  declarations: [MemberPhotoPage]
})
export class MemberPhotoPageModule {}
