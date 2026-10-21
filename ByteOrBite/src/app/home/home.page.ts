import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { 
  IonContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
, AlertController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline, arrowForwardOutline, fastFoodOutline, restaurantOutline, personOutline, personCircleOutline } from 'ionicons/icons';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    RouterLink
  ],
})
export class HomePage {
  constructor(private dataService: DataService, private alertController: AlertController, private toastController: ToastController) {
    addIcons({ starOutline, arrowForwardOutline, fastFoodOutline, restaurantOutline, personOutline, personCircleOutline });
  }

  getImageUrl(path: string) {
    if (!path) return 'assets/1024v5.png';
    if (path.startsWith('http') || path.startsWith('assets/')) {
      return path;
    }
    return `${this.dataService.getApiUrl()}/${path}`;
  }

  private homePressTimer: any;

  startHomePress(event?: Event) {
    this.homePressTimer = setTimeout(() => {
      if (navigator.vibrate) {
        try { navigator.vibrate(60); } catch (e) {}
      }
      this.showServerConfigPrompt();
    }, 700);
  }

  endHomePress(event?: Event) {
    if (this.homePressTimer) {
      clearTimeout(this.homePressTimer);
      this.homePressTimer = null;
    }
  }

  async showServerConfigPrompt() {
    const currentUrl = localStorage.getItem('custom_api_url') || 'http://localhost:3000';
    const displayVal = currentUrl.replace('http://', '').replace('https://', '').replace(':3000', '');

    const alert = await this.alertController.create({
      header: 'Configura IP Server PC',
      subHeader: 'Inserisci l\'indirizzo IP del PC per i test da mobile',
      message: 'Es: 192.168.1.133 (porta :3000 e http:// verranno aggiunte automaticamente). Server attuale: ' + currentUrl,
      inputs: [
        {
          name: 'serverIp',
          type: 'text',
          placeholder: 'Es. 192.168.1.133',
          value: displayVal === 'localhost' ? '' : displayVal
        }
      ],
      buttons: [
        {
          text: 'Reset Localhost',
          role: 'destructive',
          handler: () => {
            localStorage.removeItem('custom_api_url');
            this.showToast('Server ripristinato a: http://localhost:3000', 'warning');
            setTimeout(() => window.location.reload(), 800);
          }
        },
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Conferma',
          handler: (data) => {
            const raw = data.serverIp;
            if (!raw || !raw.trim()) {
              localStorage.removeItem('custom_api_url');
              this.showToast('Server ripristinato a: http://localhost:3000', 'warning');
            } else {
              let clean = raw.trim();
              if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
                clean = 'http://' + clean;
              }
              if (clean.endsWith('/')) {
                clean = clean.slice(0, -1);
              }
              if (!clean.includes(':', 7) && !clean.includes('loca.lt') && !clean.includes('ngrok')) {
                clean = clean + ':3000';
              }
              localStorage.setItem('custom_api_url', clean);
              this.showToast('Server impostato su: ' + clean, 'success');
            }
            setTimeout(() => window.location.reload(), 800);
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}
