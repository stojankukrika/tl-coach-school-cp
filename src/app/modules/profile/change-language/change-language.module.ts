import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChangeLanguagePageRoutingModule } from './change-language-routing.module';
import { ChangeLanguagePage } from './change-language.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeLanguagePageRoutingModule,
    TranslateModule
  ],
  declarations: [ChangeLanguagePage]
})
export class ChangeLanguagePageModule {}
