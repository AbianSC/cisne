import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CentreService, CentreTherapist } from '../services/therapist.service';

@Component({
  selector: 'app-centre-therapists',
  templateUrl: './centre-therapists.page.html',
  styleUrls: ['./centre-therapists.page.scss'],
  standalone: false,
})
export class CentreTherapistsPage implements OnInit {
  terapeutas: CentreTherapist[] = [];
  loading = false;

  form = this.fb.group({
    Id_user_therapist: [null as any, [Validators.required]],
    Contract: ['No especificado'],
  });

  constructor(
    private fb: FormBuilder,
    private centre: CentreService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  volver() {
    this.router.navigateByUrl('/dashboard');
  }

  cargar(event?: any) {
    this.loading = true;
    this.centre.getMyTherapists().subscribe({
      next: (res) => {
        this.terapeutas = res.data || [];
        this.loading = false;
        event?.target?.complete?.();
      },
      error: async (err) => {
        this.loading = false;
        event?.target?.complete?.();
        await this.presentAlert('Error', err?.error?.message || 'No se pudieron cargar terapeutas');
      }
    });
  }

  agregar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      Id_user_therapist: Number(this.form.value.Id_user_therapist),
      Contract: this.form.value.Contract || 'No especificado',
    };

    this.centre.addTherapistToMyCentre(payload).subscribe({
      next: async () => {
        await this.presentToast('Terapeuta agregado ✅');
        this.form.reset({ Id_user_therapist: null as any, Contract: 'No especificado' });
        this.cargar();
      },
      error: async (err) => {
        await this.presentAlert('Error', err?.error?.message || 'No se pudo agregar el terapeuta');
      }
    });
  }

  async eliminar(t: CentreTherapist) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar terapeuta',
      message: `¿Quitar a ${t.firstname} ${t.lastname} del centro?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.centre.removeTherapistFromMyCentre(t.Id_user_therapist).subscribe({
              next: async () => {
                await this.presentToast('Terapeuta eliminado ✅');
                this.cargar();
              },
              error: async (err) => {
                await this.presentAlert('Error', err?.error?.message || 'No se pudo eliminar');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  private async presentAlert(header: string, message: string) {
    const a = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await a.present();
  }

  private async presentToast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 1500, position: 'bottom' });
    await t.present();
  }
}