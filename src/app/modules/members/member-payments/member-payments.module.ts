import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MemberPaymentsPageRoutingModule } from './member-payments-routing.module';
import { MemberPaymentsPage } from './member-payments.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemberPaymentsPageRoutingModule,
    TranslateModule
  ],
  declarations: [MemberPaymentsPage]
})
export class MemberPaymentsPageModule {}
