import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, 
  IonButtons, IonBackButton, 
  IonLabel, IonIcon, IonButton, IonCard, 
  IonCardHeader, IonCardSubtitle, IonCardTitle, 
  IonCardContent, IonGrid, IonRow, IonCol,
  IonListHeader, IonBadge, IonAccordionGroup, IonAccordion, IonItem,
  Platform, AlertController, ToastController, ModalController,
  IonRefresher, IonRefresherContent, IonProgressBar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, mailOutline, locationOutline, 
  lockClosedOutline, sunnyOutline, moonOutline, 
  settingsOutline, logOutOutline, createOutline,
  starOutline, chevronForwardOutline, navigateOutline,
  mapOutline
} from 'ionicons/icons';
import { AuthService, User } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { MapModalComponent } from '../components/map-modal/map-modal.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle, 
    IonButtons, IonBackButton, 
    IonLabel, IonIcon, IonButton, IonCard, 
    IonCardHeader, IonCardSubtitle, IonCardTitle, 
    IonCardContent, IonGrid, IonRow, IonCol,
    IonListHeader, IonBadge, IonAccordionGroup, IonAccordion, IonItem,
    IonRefresher, IonRefresherContent, IonProgressBar,
    CommonModule, FormsModule
  ]
})
export class ProfilePage implements OnInit {
  currentUser$: Observable<User | null>;
  isDarkMode$: Observable<boolean>;
  isMobile: boolean;
  ordini: any[] = [];
  
  get ordiniInCorso() {
    return this.ordini.filter(o => o.stato !== 'completato');
  }

  get ordiniCompletati() {
    return this.ordini.filter(o => o.stato === 'completato');
  }
  formatStato(stato: string): string {
    if (!stato) return '';
    if (stato.toLowerCase() === 'spedito' || stato.toLowerCase() === 'in consegna') {
      return 'IN CONSEGNA';
    }
    return stato.toUpperCase();
  }

  getStatoBadgeColor(stato: string): string {
    if (!stato) return 'primary';
    const s = stato.toLowerCase();
    if (s === 'completato') return 'success';
    if (s === 'spedito' || s === 'in consegna') return 'warning';
    if (s === 'in preparazione') return 'tertiary';
    return 'primary';
  }

  private cachedMapUrlString: string = '';
  private cachedMapUrl: SafeResourceUrl | null = null;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private platform: Platform,
    private router: Router,
    private alertController: AlertController,

    private toastController: ToastController,
    private dataService: DataService,
    private modalController: ModalController,

    private sanitizer: DomSanitizer
  ) {
    addIcons({ 
      personOutline, mailOutline, locationOutline, 
      lockClosedOutline, sunnyOutline, moonOutline, 
      settingsOutline, logOutOutline, createOutline,
      starOutline, chevronForwardOutline, navigateOutline,
      mapOutline
    });
    this.currentUser$ = this.authService.currentUser$;
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.isMobile = this.platform.is('mobile') || this.platform.is('hybrid');
  }

  ngOnInit() {
    this.loadOrderHistory();
  }

  ionViewWillEnter() {
    this.loadOrderHistory();
  }

  getMapPreviewUrl(lat?: number, lon?: number): SafeResourceUrl | null {
    if (!lat || !lon) return null;
    const url = `https://maps.google.com/maps?q=${lat},${lon}&hl=it&z=15&output=embed`;
    if (this.cachedMapUrlString !== url) {
      this.cachedMapUrlString = url;
      this.cachedMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return this.cachedMapUrl;
  }

  parseLocation(location: string | undefined): any {
    if (!location) return null;
    try {
      return JSON.parse(location);
    } catch (e) {
      return { address: location };
    }
  }

  loadOrderHistory(event?: any) {
    const user = JSON.parse(localStorage.getItem('byte_or_bite_user') || '{}');
    if (user.id) {
      this.dataService.getOrdiniByUtente(user.id).subscribe({
        next: (res) => {
          this.ordini = res;
          if (event) {
            event.target.complete();
          }
        },
        error: (err) => {
          console.error('Errore caricamento ordini', err);
          if (event) {
            event.target.complete();
          }
        }
      });
    } else {
      if (event) {
        event.target.complete();
      }
    }
  }

  handleRefresh(event: any) {
    this.loadOrderHistory(event);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  getNextMilestone(points: number = 0): { points: number, discount: number, maxReached?: boolean } {
    const milestones: { points: number, discount: number, maxReached?: boolean }[] = [
      { points: 10, discount: 5, maxReached: false },
      { points: 20, discount: 10, maxReached: false },
      { points: 30, discount: 15, maxReached: false },
      { points: 40, discount: 20, maxReached: false },
      { points: 50, discount: 25, maxReached: false },
      { points: 60, discount: 30, maxReached: false }
    ];

    for (let milestone of milestones) {
      if (points < milestone.points) {
        return milestone;
      }
    }
    
    return { points: 60, discount: 30, maxReached: true };
  }

  getProgressPercentage(points: number = 0) {
    const milestone = this.getNextMilestone(points);
    if ((milestone as any).maxReached) {
      return 1;
    }
    return points / milestone.points;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/tabs/home']);
  }

  async editField(field: string) {
    if (field === 'posizione') {
      await this.getCurrentLocation();
      return;
    }

    const alertVerify = await this.alertController.create({
      header: 'Verifica Identità',
      message: 'Per modificare questo campo, inserisci la tua password attuale.',
      cssClass: 'modern-alert',
      inputs: [{ name: 'password', type: 'password', placeholder: 'Password Attuale' }],
      buttons: [
        { text: 'Annulla', role: 'cancel', cssClass: 'alert-button-cancel' },
        { 
          text: 'Verifica', 
          cssClass: 'alert-button-confirm',
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
      cssClass: 'modern-alert',
      inputs: [{ name: 'value', type: inputType, placeholder: placeholder }],
      buttons: [
        { text: 'Annulla', role: 'cancel', cssClass: 'alert-button-cancel' },
        { 
          text: 'Salva', 
          cssClass: 'alert-button-confirm',
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

  async getCurrentLocation() {
    const user = JSON.parse(localStorage.getItem('byte_or_bite_user') || '{}');
    const loc = this.parseLocation(user.location);
    let initialLat, initialLon;

    if (loc && loc.lat && loc.lon) {
      initialLat = loc.lat;
      initialLon = loc.lon;
    }

    const modal = await this.modalController.create({
      component: MapModalComponent,
      cssClass: 'full-screen-modal',
      componentProps: {
        initialLat,
        initialLon
      }
    });
    
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.address) {
      const locationData = JSON.stringify({
        address: data.address,
        lat: data.coords.lat,
        lon: data.coords.lon
      });
      this.updateUser({ location: locationData });
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
