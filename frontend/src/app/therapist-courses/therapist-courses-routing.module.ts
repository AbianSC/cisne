import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TherapistCoursesPage } from './therapist-courses.page';

const routes: Routes = [
  { path: '', component: TherapistCoursesPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TherapistCoursesPageRoutingModule {}