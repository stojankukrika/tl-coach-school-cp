import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfileAvatarPageRoutingModule } from './profile-avatar-routing.module';
import { ProfileAvatarPage } from './profile-avatar.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileAvatarPageRoutingModule,
    TranslateModule
  ],
  declarations: [ProfileAvatarPage]
})
export class ProfileAvatarPageModule {}
