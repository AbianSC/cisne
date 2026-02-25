import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ResourceService } from '../services/resource.service';

@Component({
  selector: 'app-patient-resources',
  templateUrl: './patient-resources.page.html',
  styleUrls: ['./patient-resources.page.scss'],
  standalone: false,
})
export class PatientResourcesPage {
  loading = false;
  feed: any[] = [];

  constructor(
    private resourceService: ResourceService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ionViewWillEnter() {
    this.cargar();
  }

  volver() {
    this.router.navigateByUrl('/dashboard', { replaceUrl: true });
  }

  cargar() {
    this.loading = true;
    this.resourceService.getFeed().subscribe({
      next: (res) => {
        this.feed = res.data || [];
        this.loading = false;
      },
      error: async () => {
        this.loading = false;
        await this.toast('No se pudo cargar tu feed de recursos.');
      },
    });
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 1400, position: 'bottom' });
    await t.present();
  }
}