import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MemberSearchPageRoutingModule } from './member-search-routing.module';
import { MemberSearchPage } from './member-search.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemberSearchPageRoutingModule,
    TranslateModule
  ],
  declarations: [MemberSearchPage]
})
export class MemberSearchPageModule {}
