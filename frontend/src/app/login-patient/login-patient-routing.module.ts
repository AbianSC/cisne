import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPatientPage } from './login-patient.page';

const routes: Routes = [
  {
    path: '',
    component: LoginPatientPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPatientPageRoutingModule {}
