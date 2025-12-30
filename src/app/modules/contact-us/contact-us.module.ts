import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ContactUsPageRoutingModule } from './contact-us-routing.module';
import { ContactUsPage } from './contact-us.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactUsPageRoutingModule,
    TranslateModule
  ],
  declarations: [ContactUsPage]
})
export class ContactUsPageModule {}
