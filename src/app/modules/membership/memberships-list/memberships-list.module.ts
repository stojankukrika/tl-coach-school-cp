import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MembershipsListPageRoutingModule } from './memberships-list-routing.module';
import { MembershipsListPage } from './memberships-list.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MembershipsListPageRoutingModule,
    TranslateModule
  ],
  declarations: [MembershipsListPage]
})
export class MembershipsListPageModule {}
