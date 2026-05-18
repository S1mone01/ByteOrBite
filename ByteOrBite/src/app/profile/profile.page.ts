import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, 
  IonButtons, IonBackButton, IonList, IonItem, 
  IonLabel, IonIcon, IonButton, IonCard, 
  IonCardHeader, IonCardSubtitle, IonCardTitle, 
  IonCardContent, IonGrid, IonRow, IonCol,
  IonListHeader, IonToggle, IonBadge,
  Platform, AlertController, LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, mailOutline, locationOutline, 
  lockClosedOutline, sunnyOutline, moonOutline, 
  settingsOutline, logOutOutline, createOutline,
  starOutline, chevronForwardOutline, navigateOutline
} from 'ionicons/icons';
import { AuthService, User } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle, 
    IonButtons, IonBackButton, IonList, IonItem, 
    IonLabel, IonIcon, IonButton, IonCard, 
    IonCardHeader, IonCardSubtitle, IonCardTitle, 
    IonCardContent, IonGrid, IonRow, IonCol,
    IonListHeader, IonToggle, IonBadge,
    CommonModule, FormsModule
  ]
})
export class ProfilePage implements OnInit {
  currentUser$: Observable<User | null>;
  isDarkMode$: Observable<boolean>;
  isMobile: boolean;
  ordini: any[] = [];

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private platform: Platform,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private dataService: DataService
  ) {
    addIcons({ 
      personOutline, mailOutline, locationOutline, 
      lockClosedOutline, sunnyOutline, moonOutline, 
      settingsOutline, logOutOutline, createOutline,
      starOutline, chevronForwardOutline, navigateOutline
    });
    this.currentUser$ = this.authService.currentUser$;
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.isMobile = this.platform.is('mobile') || this.platform.is('hybrid');
  }

  ngOnInit() {
    this.loadOrderHistory();
  }

  loadOrderHistory() {
    const user = JSON.parse(localStorage.getItem('byte_or_bite_user') || '{}');
    if (user.id) {
      this.dataService.getOrdiniByUtente(user.id).subscribe({
        next: (res) => this.ordini = res,
        error: (err) => console.error('Errore caricamento ordini', err)
      });
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/tabs/login']);
  }

  async editField(field: string) {
    if (field === 'posizione') {
      await this.showLocationOptions();
      return;
    }

    // Per Nome, Email e Password chiediamo prima la verifica della password attuale
    const alertVerify = await this.alertController.create({
      header: 'Verifica Identità',
      message: 'Per modificare questo campo, inserisci la tua password attuale.',
      inputs: [{ name: 'password', type: 'password', placeholder: 'Password Attuale' }],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Verifica', 
          handler: (data) => {
            this.verifyAndProceed(field, data.password);
          }
        }
      ]
    });
    await alertVerify.present();
  }

  async verifyAndProceed(field: string, oldPassword: string) {
    const currentUser = JSON.parse(localStorage.getItem('byte_or_bite_user') || '{}');
    
    this.authService.verifyPassword(currentUser.id, oldPassword).subscribe({
      next: async () => {
        // Se verificata, procediamo a chiedere il nuovo valore
        await this.showNewValueInput(field);
      },
      error: async (err) => {
        this.showToast('Verifica fallita: ' + (err.error?.error || 'Errore di connessione'), 'danger');
      }
    });
  }

  async showNewValueInput(field: string) {
    let header = '';
    let placeholder = '';
    let inputType: 'text' | 'email' | 'password' = 'text';

    switch(field) {
      case 'name': 
        header = 'Nuovo Nome'; 
        placeholder = 'Inserisci nome'; 
        break;
      case 'email': 
        header = 'Nuova Email'; 
        placeholder = 'esempio@email.com'; 
        inputType = 'email'; 
        break;
      case 'password': 
        header = 'Nuova Password'; 
        placeholder = 'Almeno 6 caratteri'; 
        inputType = 'password'; 
        break;
    }

    const alert = await this.alertController.create({
      header: header,
      inputs: [{ name: 'value', type: inputType, placeholder: placeholder }],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Salva', 
          handler: (data) => {
            if (data.value) {
              const updateData: any = {};
              updateData[field] = data.value;
              this.updateUser(updateData);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async showLocationOptions() {
    const alert = await this.alertController.create({
      header: 'Aggiorna Posizione',
      message: 'Come vuoi inserire la tua posizione?',
      buttons: [
        {
          text: 'Inserimento Manuale',
          handler: () => this.showManualLocationInput()
        },
        {
          text: 'Condividi Posizione (GPS)',
          handler: () => this.getCurrentLocation()
        },
        {
          text: 'Annulla',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async showManualLocationInput() {
    const alert = await this.alertController.create({
      header: 'Inserisci Indirizzo',
      inputs: [
        {
          name: 'location',
          type: 'text',
          placeholder: 'Via, Città, CAP',
        }
      ],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Salva', 
          handler: (data) => {
            if (data.location) {
              this.updateUser({ location: data.location });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async getCurrentLocation() {
    const loading = await this.loadingController.create({
      message: 'Recupero posizione...'
    });
    await loading.present();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const locationString = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
          
          await loading.dismiss();
          this.updateUser({ location: locationString });
        },
        async (error) => {
          await loading.dismiss();
          this.showToast('Errore nel recupero della posizione: ' + error.message, 'danger');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      await loading.dismiss();
      this.showToast('Geolocalizzazione non supportata dal tuo dispositivo.', 'danger');
    }
  }

  updateUser(data: Partial<User>) {
    const currentUser = JSON.parse(localStorage.getItem('byte_or_bite_user') || '{}');
    if (!currentUser.id) return;

    this.authService.updateUser(currentUser.id, data).subscribe({
      next: () => this.showToast('Profilo aggiornato con successo!'),
      error: (err) => this.showToast('Errore durante l\'aggiornamento: ' + (err.error?.error || err.message), 'danger')
    });
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  goToManage() {
    this.router.navigate(['/tabs/manage']);
  }
}
