import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginCentrePageRoutingModule } from './login-centre-routing.module';

import { LoginCentrePage } from './login-centre.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginCentrePageRoutingModule
  ],
  declarations: [LoginCentrePage]
})
export class LoginCentrePageModule {}
