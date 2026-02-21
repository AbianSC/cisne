import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AlertController } from '@ionic/angular';

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
    private alertController: AlertController
  ) {
    this.initForms();
  }

  initForms() {
    this.registerForm = this.fb.group({
      userType: ['patient', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      nif: [''],
      cif: [''],
      phone: [''],
      societyId: [''],
      profession: [''],
      diagnosis: [''],
      location: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    if (password !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
      buttons: ['OK']
    });
    await alert.present();
  }

  onRegister() {
    if (this.registerForm.valid) {
      console.log('Registro:', this.registerForm.value);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Login:', this.loginForm.value);
    } else {
      this.loginForm.markAllAsTouched();
    }
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
}
