import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TherapistAssignPatientPage } from './therapist-assign-patient.page';

const routes: Routes = [
  {
    path: '',
    component: TherapistAssignPatientPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TherapistAssignPatientPageRoutingModule {}