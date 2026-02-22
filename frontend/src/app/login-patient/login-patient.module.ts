import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPatientPageRoutingModule } from './login-patient-routing.module';

import { LoginPatientPage } from './login-patient.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPatientPageRoutingModule
  ],
  declarations: [LoginPatientPage]
})
export class LoginPatientPageModule {}
