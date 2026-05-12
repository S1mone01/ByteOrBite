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
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonSpinner, IonCheckbox, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  mailOutline, lockClosedOutline, personOutline, 
  eyeOutline, eyeOffOutline, logInOutline, personAddOutline,
  arrowBackOutline, checkmarkCircleOutline, closeOutline
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
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ 
      mailOutline, lockClosedOutline, personOutline, 
      eyeOutline, eyeOffOutline, logInOutline, personAddOutline,
      arrowBackOutline, checkmarkCircleOutline, closeOutline
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
    this.isLogin = event.detail.value === 'login';
    this.isForgotPassword = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.initForm();
  }

  setForgotPassword(value: boolean) {
    this.isForgotPassword = value;
    this.errorMessage = '';
    this.successMessage = '';
    this.initForm();
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

  async onSubmit() {
    if (this.authForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password, name } = this.authForm.value;

    if (this.isForgotPassword) {
      this.authService.resetPassword(email).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Ti abbiamo inviato un link per reimpostare la password.';
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Impossibile inviare la mail. Riprova.';
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
