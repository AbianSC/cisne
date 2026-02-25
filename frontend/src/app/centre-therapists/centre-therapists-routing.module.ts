import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CentreTherapistsPage } from './centre-therapists.page';

const routes: Routes = [
  { path: '', component: CentreTherapistsPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CentreTherapistsPageRoutingModule {}