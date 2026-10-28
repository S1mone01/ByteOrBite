import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, FormGroup, Validators, ReactiveFormsModule 
} from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonButton, IonList, 
  IonText, IonIcon, IonButtons, IonSegment, IonSegmentButton,
  IonCard, IonCardHeader, IonCardContent,
  IonSpinner, IonCheckbox, IonModal, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  mailOutline, lockClosedOutline, personOutline, 
  eyeOutline, eyeOffOutline, logInOutline, personAddOutline,
  arrowBackOutline, checkmarkCircleOutline, closeOutline,
  copyOutline, checkmarkOutline, keyOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonItem, IonLabel, IonInput, IonButton, IonList, 
    IonText, IonIcon, IonButtons, IonSegment, IonSegmentButton,
    IonCard, IonCardHeader, IonCardContent,
    IonSpinner, IonCheckbox, IonModal
  ]
})
export class LoginPage implements OnInit {
  authForm!: FormGroup;
  isLogin = true;
  isForgotPassword = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showTermsModal = false;
  generatedPassword = '';
  lastRecoveredEmail = '';
  copied = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ 
      mailOutline, lockClosedOutline, personOutline, 
      eyeOutline, eyeOffOutline, logInOutline, personAddOutline,
      arrowBackOutline, checkmarkCircleOutline, closeOutline,
      copyOutline, checkmarkOutline, keyOutline
    });
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    if (this.isForgotPassword) {
      this.authForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
      });
    } else if (this.isLogin) {
      this.authForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
    } else {
      this.authForm = this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        termsAccepted: [false, [Validators.requiredTrue]]
      });
    }
  }

  toggleMode(event: any) {
    const currentEmail = this.authForm?.get('email')?.value || '';
    this.isLogin = event.detail.value === 'login';
    this.isForgotPassword = false;
    this.generatedPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.initForm();
    if (currentEmail) {
      this.authForm.patchValue({ email: currentEmail });
    }
  }

  setForgotPassword(value: boolean) {
    const currentEmail = this.authForm?.get('email')?.value || '';
    this.isForgotPassword = value;
    this.generatedPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.initForm();
    if (currentEmail) {
      this.authForm.patchValue({ email: currentEmail });
    }
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
      setTimeout(() => {
        this.copied = false;
      }, 3000);
    } catch (err) {
      console.error('Errore durante la copia della password:', err);
    }
  }

  goToLoginWithRecoveredPassword() {
    const email = this.lastRecoveredEmail;
    const pwd = this.generatedPassword;
    this.isForgotPassword = false;
    this.isLogin = true;
    this.generatedPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.initForm();
    this.authForm.patchValue({
      email: email,
      password: pwd
    });
    this.showPassword = true;
  }

  async onSubmit() {
    if (this.authForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password, name } = this.authForm.value;

    if (this.isForgotPassword) {
      this.authService.resetPassword(email).subscribe({
        next: async (res) => {
          this.isLoading = false;
          this.generatedPassword = res.newPassword;
          this.lastRecoveredEmail = email;
          this.errorMessage = '';

          const alert = await this.alertController.create({
            header: 'Password Recuperata!',
            subHeader: 'Nuova password temporanea generata',
            message: `È stata generata una nuova password per ${email}.`,
            cssClass: 'modern-alert',
            buttons: [
              {
                text: 'OK',
                role: 'confirm',
                cssClass: 'alert-button-confirm'
              }
            ]
          });
          await alert.present();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Impossibile recuperare la password. Verifica l\'email inserita e riprova.';
        }
      });
      return;
    }

    const authObs = this.isLogin 
      ? this.authService.login(email, password)
      : this.authService.register(email, password, name);

    authObs.subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl('/tabs/home');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Errore durante l\'autenticazione. Riprova.';
        console.error(err);
      }
    });
  }
}
