import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PatientResourcesPageRoutingModule } from './patient-resources-routing.module';
import { PatientResourcesPage } from './patient-resources.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PatientResourcesPageRoutingModule],
  declarations: [PatientResourcesPage],
})
export class PatientResourcesPageModule {}