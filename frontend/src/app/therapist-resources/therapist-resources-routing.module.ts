import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TherapistResourcesPage } from './therapist-resources.page';

const routes: Routes = [
  {
    path: '',
    component: TherapistResourcesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TherapistResourcesPageRoutingModule {}