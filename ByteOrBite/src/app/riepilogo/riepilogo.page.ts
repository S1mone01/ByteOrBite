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
  removeOutline, checkmarkCircle, createOutline, ticketOutline, sparklesOutline, lockClosedOutline 
} from 'ionicons/icons';
import { CartService } from '../services/cart.service';
import { DataService } from '../services/data.service';
import { AuthService, User } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { MapModalComponent } from '../components/map-modal/map-modal.component';
import { Observable, take } from 'rxjs';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
export class RiepilogoPage implements OnInit {
  cartItems$: Observable<any[]>;
  currentUser$: Observable<User | null>;
  isDarkMode$: Observable<boolean>;
  paymentMethod: string = 'contanti';
  deliveryFee: number = 1.99;
  
  useCoupon: boolean = false;
  selectedCouponPercentage: number = 0;
  highlightMissingAddress: boolean = false;
  
  private cachedMapUrlString: string = '';
  private cachedMapUrl: SafeResourceUrl | null = null;

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
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    addIcons({ 
      locationOutline, personOutline, mapOutline, 
      cashOutline, cardOutline, alertCircleOutline, 
      starOutline, addOutline, removeOutline, checkmarkCircle, createOutline,
      ticketOutline, sparklesOutline, lockClosedOutline
    });
    this.cartItems$ = this.cartService.cartItems$;
    this.currentUser$ = this.authService.currentUser$;
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  ngOnInit() {}

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

  hasDeliveryAddress(user: User | null): boolean {
    if (!user || !user.location) return false;
    let address = '';
    const parsed = this.parseLocation(user.location);
    if (parsed && typeof parsed === 'object' && parsed.address) {
      address = parsed.address;
    } else if (typeof user.location === 'string') {
      address = user.location;
    }
    address = address.trim();
    if (!address) return false;
    const invalidPlaceholders = [
      'clicca per inserire il tuo indirizzo',
      'nessuna posizione salvata',
      'consegna a domicilio'
    ];
    return !invalidPlaceholders.includes(address.toLowerCase());
  }

  getDisplayAddress(user: User | null): string {
    if (!user || !this.hasDeliveryAddress(user)) {
      return 'Clicca per inserire il tuo indirizzo';
    }
    const parsed = this.parseLocation(user.location);
    if (parsed && typeof parsed === 'object' && parsed.address) {
      return parsed.address;
    }
    return user.location || 'Clicca per inserire il tuo indirizzo';
  }

  async editAddress() {
    this.highlightMissingAddress = false;
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
            this.highlightMissingAddress = false;
            this.showToast('Indirizzo di consegna aggiornato!', 'success');
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

  // 4 scaglioni coupon (max 20%)
  couponsList = [
    { points: 10, percentage: 5, label: '5% Sconto (10 Punti)' },
    { points: 20, percentage: 10, label: '10% Sconto (20 Punti)' },
    { points: 30, percentage: 15, label: '15% Sconto (30 Punti)' },
    { points: 40, percentage: 20, label: '20% Sconto (40 Punti)' }
  ];

  getAvailableCoupons(userPoints: number = 0) {
    return this.couponsList.filter(c => c.points <= userPoints);
  }

  onCouponToggle(userPoints: number = 0) {
    if (userPoints < 10) {
      this.useCoupon = false;
      this.selectedCouponPercentage = 0;
      return;
    }
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

  async toggleCoupon(userPoints: number = 0) {
    if (userPoints < 10) {
      const toast = await this.toastController.create({
        message: `Hai ${userPoints} ${userPoints === 1 ? 'punto' : 'punti'}. Servono almeno 10 punti per riscattare uno sconto.`,
        duration: 2500,
        color: 'warning',
        position: 'bottom'
      });
      toast.present();
      return;
    }
    this.useCoupon = !this.useCoupon;
    this.onCouponToggle(userPoints);
  }

  async selectCouponTier(coupon: any, userPoints: number = 0) {
    if (userPoints < coupon.points) {
      const toast = await this.toastController.create({
        message: `Servono almeno ${coupon.points} punti per sbloccare il coupon -${coupon.percentage}% (ne hai ${userPoints}).`,
        duration: 2500,
        color: 'warning',
        position: 'bottom'
      });
      toast.present();
      return;
    }

    if (this.useCoupon && this.selectedCouponPercentage === coupon.percentage) {
      this.useCoupon = false;
      this.selectedCouponPercentage = 0;
    } else {
      this.useCoupon = true;
      this.selectedCouponPercentage = coupon.percentage;
    }
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
    this.currentUser$.pipe(take(1)).subscribe(async user => {
      if (!this.hasDeliveryAddress(user)) {
        this.highlightMissingAddress = true;
        const toast = await this.toastController.create({
          message: 'Aggiungi un indirizzo di consegna per completare l\'ordine',
          duration: 3000,
          color: 'warning',
          position: 'bottom',
          buttons: [
            {
              text: 'Aggiungi',
              role: 'info',
              handler: () => {
                this.editAddress();
              }
            }
          ]
        });
        await toast.present();

        const addressCard = document.getElementById('delivery-address-card');
        if (addressCard) {
          addressCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      this.cartItems$.pipe(take(1)).subscribe(async items => {
        if (!items || items.length === 0) {
          const toast = await this.toastController.create({
            message: 'Il tuo carrello è vuoto',
            duration: 2500,
            color: 'warning',
            position: 'bottom'
          });
          await toast.present();
          return;
        }

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

  formatModifiche(modifiche: string): string[] {
    if (!modifiche) return [];
    if (modifiche.includes('Starter:') || modifiche.includes('Bibita:')) {
      return modifiche
        .split(/(?:,\s*|\n+)(?=[A-Z][a-zA-ZÀ-ÿ\s]*:)/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    if (modifiche.includes('\n')) {
      return modifiche.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    }
    return [modifiche];
  }
}


