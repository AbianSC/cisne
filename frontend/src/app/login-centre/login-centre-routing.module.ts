import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginCentrePage } from './login-centre.page';

const routes: Routes = [
  {
    path: '',
    component: LoginCentrePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginCentrePageRoutingModule {}
