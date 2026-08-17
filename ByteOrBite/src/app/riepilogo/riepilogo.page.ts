import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
  IonLabel, IonThumbnail, IonButton, IonButtons, 
  IonBackButton, IonIcon, IonCard, IonCardContent, IonText, IonListHeader,
  ToastController, IonRadioGroup, IonRadio, IonCheckbox, IonCardHeader, IonCardTitle,
  IonBadge, AlertController, LoadingController, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  locationOutline, personOutline, mapOutline, cashOutline, 
  cardOutline, alertCircleOutline, starOutline, addOutline, 
  removeOutline, checkmarkCircle, createOutline, ticketOutline, sparklesOutline 
} from 'ionicons/icons';
import { CartService } from '../services/cart.service';
import { DataService } from '../services/data.service';
import { AuthService, User } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { MapModalComponent } from '../components/map-modal/map-modal.component';
import { Observable, Subscription, take } from 'rxjs';
import { Router } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-riepilogo',
  templateUrl: './riepilogo.page.html',
  styleUrls: ['./riepilogo.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
    IonLabel, IonThumbnail, IonButton, IonButtons, 
    IonBackButton, IonIcon, IonCard, IonCardContent, IonText, IonListHeader,
    IonRadioGroup, IonRadio, IonCheckbox, IonCardHeader, IonCardTitle, IonBadge
  ]
})
export class RiepilogoPage implements OnInit, AfterViewChecked, OnDestroy {
  cartItems$: Observable<any[]>;
  currentUser$: Observable<User | null>;
  paymentMethod: string = 'contanti';
  deliveryFee: number = 1.99;
  
  useCoupon: boolean = false;
  selectedCouponPercentage: number = 0;
  
  private previewMap?: L.Map;
  private lastLat?: number;
  private lastLon?: number;
  private lastTheme?: boolean;
  private themeSub?: Subscription;

  constructor(
    private cartService: CartService,
    private dataService: DataService,
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private http: HttpClient
  ) {
    addIcons({ 
      locationOutline, personOutline, mapOutline, 
      cashOutline, cardOutline, alertCircleOutline, 
      starOutline, addOutline, removeOutline, checkmarkCircle, createOutline,
      ticketOutline, sparklesOutline
    });
    this.cartItems$ = this.cartService.cartItems$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.themeSub = this.themeService.isDarkMode$.subscribe(() => {
      this.updatePreviewMap();
    });
  }

  ngOnDestroy() {
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
    if (this.previewMap) {
      this.previewMap.remove();
    }
  }

  ngAfterViewChecked() {
    this.updatePreviewMap();
  }

  updatePreviewMap() {
    const user = JSON.parse(localStorage.getItem('byte_or_bite_user') || '{}');
    const loc = this.parseLocation(user.location);
    const isDark = this.themeService.currentThemeValue;
    
    if (loc && loc.lat && loc.lon) {
      if (this.lastLat === loc.lat && this.lastLon === loc.lon && this.lastTheme === isDark && this.previewMap) {
        return;
      }

      this.lastLat = loc.lat;
      this.lastLon = loc.lon;
      this.lastTheme = isDark;

      setTimeout(() => {
        const container = document.getElementById('riepilogo-map-preview');
        if (container) {
          if (this.previewMap) {
            this.previewMap.remove();
          }

          this.previewMap = L.map('riepilogo-map-preview', {
            zoomControl: false,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            attributionControl: false
          }).setView([loc.lat, loc.lon], 15);

          const tileUrl = isDark 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

          L.tileLayer(tileUrl).addTo(this.previewMap);

          const defaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [20, 32],
            iconAnchor: [10, 32]
          });

          L.marker([loc.lat, loc.lon], { icon: defaultIcon }).addTo(this.previewMap);
          
          this.previewMap.invalidateSize();
        }
      }, 100);
    }
  }

  parseLocation(location: string | undefined): any {
    if (!location) return null;
    try {
      return JSON.parse(location);
    } catch (e) {
      return { address: location };
    }
  }

  async editAddress() {
    const alert = await this.alertController.create({
      header: 'Modifica Indirizzo',
      message: 'Scegli la modalità per aggiornare la posizione di consegna:',
      cssClass: 'modern-alert location-alert',
      buttons: [
        {
          text: 'Manuale',
          cssClass: 'alert-button-option inline-button',
          handler: () => this.showManualLocationInput()
        },
        {
          text: 'Mappa Interattiva',
          cssClass: 'alert-button-option inline-button',
          handler: () => this.openMapModal()
        },
        {
          text: 'Annulla',
          role: 'cancel',
          cssClass: 'alert-button-cancel full-width-button'
        }
      ]
    });
    await alert.present();
  }

  async showManualLocationInput() {
    const alert = await this.alertController.create({
      header: 'Inserisci Indirizzo',
      cssClass: 'modern-alert',
      inputs: [
        {
          name: 'location',
          type: 'text',
          placeholder: 'Via, Città, CAP',
        }
      ],
      buttons: [
        { text: 'Annulla', role: 'cancel', cssClass: 'alert-button-cancel' },
        { 
          text: 'Salva', 
          cssClass: 'alert-button-confirm',
          handler: async (data) => {
            if (data.location) {
              const loading = await this.loadingController.create({
                message: 'Ricerca posizione in corso...'
              });
              await loading.present();

              this.geocodeAddress(data.location).subscribe({
                next: (res) => {
                  loading.dismiss();
                  if (res && res.length > 0) {
                    const bestMatch = res[0];
                    const locationData = JSON.stringify({
                      address: bestMatch.display_name,
                      lat: parseFloat(bestMatch.lat),
                      lon: parseFloat(bestMatch.lon)
                    });
                    this.saveLocation(locationData);
                  } else {
                    this.saveLocation(data.location);
                    this.showToast('Indirizzo non trovato sulla mappa, salvato come testo.', 'warning');
                  }
                },
                error: (err) => {
                  loading.dismiss();
                  console.error('Errore geocoding', err);
                  this.saveLocation(data.location);
                  this.showToast('Errore durante la ricerca della posizione.', 'danger');
                }
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  geocodeAddress(address: string): Observable<any[]> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    return this.http.get<any[]>(url);
  }

  async openMapModal() {
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
      componentProps: { initialLat, initialLon }
    });
    
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.address) {
      const locationData = JSON.stringify({
        address: data.address,
        lat: data.coords.lat,
        lon: data.coords.lon
      });
      this.saveLocation(locationData);
    }
  }

  saveLocation(locationData: string) {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user && user.id) {
        this.authService.updateUser(user.id, { location: locationData }).subscribe({
          next: () => {
            this.showToast('Indirizzo di consegna aggiornato!', 'success');
            this.lastLat = undefined;
            this.lastLon = undefined;
            setTimeout(() => this.updatePreviewMap(), 100);
          },
          error: (err) => {
            console.error('Errore durante l\'aggiornamento dell\'indirizzo:', err);
            this.showToast('Errore nel salvataggio dell\'indirizzo', 'danger');
          }
        });
      }
    });
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  getImageUrl(path: string) {
    if (!path) return 'assets/1024v5.png';
    if (path.startsWith('http') || path.startsWith('assets/')) {
      return path;
    }
    return `${this.dataService.getApiUrl()}/${path}`;
  }

  getCartSubtotal(items: any[] | null) {
    if (!items) return 0;
    return items.reduce((acc, item) => acc + (item.prezzo_unitario * item.quantita), 0);
  }

  // Restituisce i coupon sbloccati in base ai punti dell'utente (ogni 10 punti 5% di sconto, max 30%)
  getAvailableCoupons(userPoints: number = 0) {
    const allCoupons = [
      { points: 10, percentage: 5, label: '5% Sconto (10 Punti)' },
      { points: 20, percentage: 10, label: '10% Sconto (20 Punti)' },
      { points: 30, percentage: 15, label: '15% Sconto (30 Punti)' },
      { points: 40, percentage: 20, label: '20% Sconto (40 Punti)' },
      { points: 50, percentage: 25, label: '25% Sconto (50 Punti)' },
      { points: 60, percentage: 30, label: '30% Sconto - MAX (60 Punti)' }
    ];

    return allCoupons.filter(c => c.points <= userPoints);
  }

  onCouponToggle(userPoints: number = 0) {
    if (this.useCoupon) {
      const available = this.getAvailableCoupons(userPoints);
      if (available.length > 0) {
        this.selectedCouponPercentage = available[available.length - 1].percentage;
      } else {
        this.selectedCouponPercentage = 0;
      }
    } else {
      this.selectedCouponPercentage = 0;
    }
  }

  selectCouponTier(percentage: number) {
    this.selectedCouponPercentage = percentage;
  }

  getPointsDiscount(user: User | null, items: any[] | null): number {
    if (!this.useCoupon || !user || !user.points || !items || !this.selectedCouponPercentage) return 0;
    
    const subtotal = this.getCartSubtotal(items);
    if (subtotal <= 0) return 0;

    const discount = (subtotal * this.selectedCouponPercentage) / 100;
    return Math.round(discount * 100) / 100;
  }

  getUsedPoints(): number {
    if (!this.useCoupon || !this.selectedCouponPercentage) return 0;
    return (this.selectedCouponPercentage / 5) * 10;
  }

  getFinalTotal(user: User | null, items: any[] | null) {
    const subtotal = this.getCartSubtotal(items);
    const discount = this.getPointsDiscount(user, items);
    return Math.max(0, subtotal - discount) + this.deliveryFee;
  }

  async confirmOrder() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      this.cartItems$.pipe(take(1)).subscribe(items => {
        const discount = this.getPointsDiscount(user, items);
        const usedPoints = this.getUsedPoints();
        
        this.cartService.checkout(discount, usedPoints).subscribe({
          next: async () => {
            const toast = await this.toastController.create({
              message: 'Ordine inviato con successo! Grazie per aver scelto ByteOrBite.',
              duration: 3000,
              color: 'success',
              position: 'bottom'
            });
            toast.present();
            this.router.navigate(['/tabs/home']);
          },
          error: (err) => {
            console.error('Errore durante il checkout:', err);
          }
        });
      });
    });
  }
}


