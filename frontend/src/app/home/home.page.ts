import { Component, HostListener } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

type Role = 'PATIENT' | 'THERAPIST' | 'CENTRE';
type UserType = 'patient' | 'therapist' | 'centre';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  registerForm!: FormGroup;
  loginForm!: FormGroup;

  showPassword = false;
  showLoginPassword = false;
  showScrollTop = false;

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private auth: AuthService,
    private router: Router
  ) {
    this.initForms();
  }

  // =========================
  // FORMS
  // =========================
  private initForms() {
    this.registerForm = this.fb.group(
      {
        userType: ['patient', Validators.required], // patient | therapist | centre
        email: ['', [Validators.required, Validators.email]],

        fullName: [''], // patient/therapist
        name: [''],     // centre

        nif: [''],      // patient/therapist
        cif: [''],      // centre
        phone: [''],

        societyId: [''], // therapist
        profession: [''], // therapist
        diagnosis: [''],  // patient
        location: [''],   // centre

        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        acceptTerms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator }
    );

    // Login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    // ✅ Aplica validadores condicionales al iniciar
    this.applyRegisterValidators(this.registerForm.get('userType')?.value as UserType);

    // ✅ Re-aplica validadores al cambiar userType
    this.registerForm.get('userType')?.valueChanges.subscribe((type: UserType) => {
      this.applyRegisterValidators(type);
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    if (password !== confirm) return { passwordMismatch: true };
    return null;
  }

  private mapRole(userType: UserType): Role {
    if (userType === 'therapist') return 'THERAPIST';
    if (userType === 'centre') return 'CENTRE';
    return 'PATIENT';
  }

  /**
   * ✅ Validadores condicionales por rol
   * - Limpia campos no usados para no arrastrar valores
   */
  private applyRegisterValidators(type: UserType) {
    const fullName = this.registerForm.get('fullName');
    const name = this.registerForm.get('name');
    const nif = this.registerForm.get('nif');
    const cif = this.registerForm.get('cif');
    const location = this.registerForm.get('location');
    const societyId = this.registerForm.get('societyId');

    // helpers
    const set = (c: AbstractControl | null, validators: any[]) => {
      if (!c) return;
      c.setValidators(validators);
      c.updateValueAndValidity({ emitEvent: false });
    };
    const clear = (c: AbstractControl | null) => {
      if (!c) return;
      c.clearValidators();
      c.updateValueAndValidity({ emitEvent: false });
    };
    const wipe = (c: AbstractControl | null) => {
      if (!c) return;
      c.reset('', { emitEvent: false });
    };

    // Limpiar todo primero (sin required)
    clear(fullName);
    clear(name);
    clear(nif);
    clear(cif);
    clear(location);
    clear(societyId);

    // Reglas por tipo
    if (type === 'centre') {
      // Centre: name, cif, location obligatorios
      set(name, [Validators.required, Validators.minLength(2)]);
      set(cif, [Validators.required, Validators.minLength(6)]);
      set(location, [Validators.required, Validators.minLength(5)]);

      // Campos que NO usa centre -> los limpio para evitar “valores viejos”
      wipe(fullName);
      wipe(nif);
      wipe(societyId);
    } else {
      // Patient/Therapist: fullName y nif obligatorios
      set(fullName, [Validators.required, Validators.minLength(2)]);
      set(nif, [Validators.required, Validators.minLength(6)]);

      // Campos que NO usan patient/therapist
      wipe(name);
      wipe(cif);
      wipe(location);

      if (type === 'therapist') {
        // En tu UI societyId tiene *, así que lo hago requerido
        set(societyId, [Validators.required, Validators.minLength(3)]);
      } else {
        // Patient no usa societyId
        wipe(societyId);
      }
    }

    // Revalida el form completo (por si cambia invalid/valid)
    this.registerForm.updateValueAndValidity({ emitEvent: false });
  }

  // =========================
  // REGISTER
  // =========================
  async onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      await this.presentAlert('Registro', 'Revisa el formulario. Hay campos inválidos.');
      return;
    }

    const v = this.registerForm.value;
    const userType: UserType = v.userType;
    const role = this.mapRole(userType);

    const payload: any = {
      email: (v.email || '').trim().toLowerCase(),
      password: v.password,
      role,
      phone: v.phone || null,
      acceptTerms: 'true',
    };

    if (role === 'PATIENT') {
      payload.fullName = v.fullName;
      payload.nif = v.nif;
      payload.diagnosis = v.diagnosis || null;
    }

    if (role === 'THERAPIST') {
      payload.fullName = v.fullName;
      payload.nif = v.nif;
      payload.societyId = v.societyId || null;
      payload.profession = v.profession || null;
    }

    if (role === 'CENTRE') {
      payload.name = v.name;
      payload.cif = v.cif;
      payload.location = v.location;
    }

    this.auth.register(payload).subscribe({
      next: async () => {
        await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      },
      error: async (err) => {
        const msg =
          err?.error?.message ||
          (Array.isArray(err?.error?.errors)
            ? err.error.errors.map((e: any) => e.msg).join('<br>')
            : null) ||
          'Error registrando usuario';
        await this.presentAlert('Registro', msg);
      },
    });
  }

  // =========================
  // LOGIN
  // =========================
  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      await this.presentAlert('Login', 'Revisa el email y la contraseña.');
      return;
    }

    const v = this.loginForm.value;

    this.auth.login({ email: (v.email || '').trim().toLowerCase(), password: v.password }).subscribe({
      next: async () => {
        await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      },
      error: async (err) => {
        const msg = err?.error?.message || 'Credenciales incorrectas';
        await this.presentAlert('Login', msg);
      },
    });
  }

  // =========================
  // UI HELPERS
  // =========================
  scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollTop = window.pageYOffset > 300;
  }

  async showServiceDetails(service: string) {
    const alert = await this.alertController.create({
      header: 'Servicio seleccionado',
      message: `Has seleccionado el servicio: ${service}`,
      buttons: ['OK'],
    });
    await alert.present();
  }

  forgotPassword() {
    console.log('Recuperar contraseña');
  }

  showTerms(event: Event) {
    event.preventDefault();
    alert('Mostrar términos y condiciones');
  }

  showPrivacy(event: Event) {
    event.preventDefault();
    alert('Mostrar política de privacidad');
  }

  // =========================
  // PRIVATE HELPERS
  // =========================
  private async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}