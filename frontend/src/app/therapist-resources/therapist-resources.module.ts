import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TherapistResourcesPageRoutingModule } from './therapist-resources-routing.module';
import { TherapistResourcesPage } from './therapist-resources.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TherapistResourcesPageRoutingModule
  ],
  declarations: [TherapistResourcesPage]
})
export class TherapistResourcesPageModule {}