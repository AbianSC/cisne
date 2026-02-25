import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TreatsService } from '../services/treats.service';

@Component({
  selector: 'app-therapist-assign-patient',
  templateUrl: './therapist-assign-patient.page.html',
  styleUrls: ['./therapist-assign-patient.page.scss'],
  standalone: false,
})
export class TherapistAssignPatientPage implements OnInit {
  patientId: number | null = null;
  report = '';
  loading = false;

  asignaciones: any[] = [];
  pacientes: any[] = [];

  constructor(
    private treats: TreatsService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarMisPacientes();
  }

  volver() {
    this.router.navigateByUrl('/dashboard', { replaceUrl: true });
  }

  asignar() {
    if (!this.patientId) return;

    this.loading = true;

    this.treats
      .assignPatientToMe({
        Id_user_patient: this.patientId,
        report: this.report || undefined,
      })
      .subscribe({
        next: async (res) => {
          this.loading = false;
          await this.toast(res.message || 'Paciente asignado.');
          this.patientId = null;
          this.report = '';
          this.cargarMisPacientes();
        },
        error: async (err) => {
          this.loading = false;
          const msg = err?.error?.message || 'No se pudo asignar el paciente.';
          await this.toast(msg);
        },
      });
  }

  cargarMisPacientes() {
    this.treats.getMyPatients().subscribe({
      next: (res) => {
        // Si tu backend devuelve data como array:
        this.asignaciones = res.data || [];
        // "pacientes" depende de otro endpoint (lista de pacientes disponibles)
        this.pacientes = [];
      },
      error: async () => {
        await this.toast('No se pudo cargar la lista de pacientes.');
      },
    });
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({
      message,
      duration: 1400,
      position: 'bottom',
    });
    await t.present();
  }
}