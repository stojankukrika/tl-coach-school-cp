import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChangeTeamPageRoutingModule } from './change-team-routing.module';
import { ChangeTeamPage } from './change-team.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeTeamPageRoutingModule,
    TranslateModule
  ],
  declarations: [ChangeTeamPage]
})
export class ChangeTeamPageModule {}
