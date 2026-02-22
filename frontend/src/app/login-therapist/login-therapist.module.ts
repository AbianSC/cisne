import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginTherapistPageRoutingModule } from './login-therapist-routing.module';

import { LoginTherapistPage } from './login-therapist.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginTherapistPageRoutingModule
  ],
  declarations: [LoginTherapistPage]
})
export class LoginTherapistPageModule {}
