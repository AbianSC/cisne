import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginTherapistPage } from './login-therapist.page';

const routes: Routes = [
  {
    path: '',
    component: LoginTherapistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginTherapistPageRoutingModule {}
