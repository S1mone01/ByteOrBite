import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput,
  IonButton, IonList, IonText, IonIcon, IonButtons, IonSegment, IonSegmentButton,
  IonCard, IonCardHeader, IonCardContent, IonCheckbox, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline, lockClosedOutline, personOutline, eyeOutline, eyeOffOutline,
  logInOutline, personAddOutline, arrowBackOutline, checkmarkCircleOutline,
  closeOutline, copyOutline, checkmarkOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput,
    IonButton, IonList, IonText, IonIcon, IonButtons, IonSegment, IonSegmentButton,
    IonCard, IonCardHeader, IonCardContent, IonCheckbox, IonModal
  ]
})
export class LoginPage implements OnInit {
  authForm!: FormGroup;
  isLogin = true;
  isForgotPassword = false;
  showPassword = false;
  errorMessage = '';
  successMessage = '';
  showTermsModal = false;
  generatedPassword = '';
  lastRecoveredEmail = '';
  copied = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      mailOutline, lockClosedOutline, personOutline, eyeOutline, eyeOffOutline,
      logInOutline, personAddOutline, arrowBackOutline, checkmarkCircleOutline,
      closeOutline, copyOutline, checkmarkOutline
    });
  }

  ngOnInit() {
    this.initForm();
  }

  initForm(email = '') {
    const emailCtrl = [email, [Validators.required, Validators.email]];
    const passwordCtrl = ['', [Validators.required, Validators.minLength(6)]];

    if (this.isForgotPassword) {
      this.authForm = this.fb.group({ email: emailCtrl });
    } else if (this.isLogin) {
      this.authForm = this.fb.group({ email: emailCtrl, password: passwordCtrl });
    } else {
      this.authForm = this.fb.group({
        name: ['', Validators.required],
        email: emailCtrl,
        password: passwordCtrl,
        termsAccepted: [false, Validators.requiredTrue]
      });
    }
  }

  private resetState(email: string) {
    this.generatedPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.initForm(email);
  }

  toggleMode(event: any) {
    const email = this.authForm?.get('email')?.value || '';
    this.isLogin = event.detail.value === 'login';
    this.isForgotPassword = false;
    this.resetState(email);
  }

  setForgotPassword(value: boolean) {
    const email = this.lastRecoveredEmail || this.authForm?.get('email')?.value || '';
    this.isForgotPassword = value;
    this.isLogin = true;
    this.resetState(email);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  openTerms(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.showTermsModal = true;
  }

  closeTerms() {
    this.showTermsModal = false;
  }

  async copyPassword() {
    if (!this.generatedPassword) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(this.generatedPassword);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = this.generatedPassword;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      this.copied = true;
      setTimeout(() => (this.copied = false), 3000);
    } catch (err) {
      console.error('Errore durante la copia della password:', err);
    }
  }

  onSubmit() {
    if (this.authForm.invalid) return;

    this.errorMessage = '';
    this.successMessage = '';

    const { email, password, name } = this.authForm.value;

    if (this.isForgotPassword) {
      this.authService.resetPassword(email).subscribe({
        next: (res) => {
          this.generatedPassword = res.newPassword;
          this.lastRecoveredEmail = email;
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Impossibile recuperare la password. Verifica l\'email inserita e riprova.';
        }
      });
      return;
    }

    const authObs = this.isLogin
      ? this.authService.login(email, password)
      : this.authService.register(email, password, name);

    authObs.subscribe({
      next: () => this.router.navigateByUrl('/tabs/home'),
      error: (err) => {
        this.errorMessage = 'Errore durante l\'autenticazione. Riprova.';
        console.error(err);
      }
    });
  }
}