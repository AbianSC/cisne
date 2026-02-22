import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CentreCoursesPage } from './centre-courses.page';

const routes: Routes = [{ path: '', component: CentreCoursesPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CentreCoursesPageRoutingModule {}