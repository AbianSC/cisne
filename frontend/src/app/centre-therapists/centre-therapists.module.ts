import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CentreTherapistsPageRoutingModule } from './centre-therapists-routing.module';
import { CentreTherapistsPage } from './centre-therapists.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CentreTherapistsPageRoutingModule
  ],
  declarations: [CentreTherapistsPage],
})
export class CentreTherapistsPageModule {}