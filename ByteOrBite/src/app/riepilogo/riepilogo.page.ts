import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
  IonLabel, IonThumbnail, IonButton, IonButtons, 
  IonBackButton, IonIcon, IonCard, IonCardContent, IonText, IonListHeader,
  ToastController, IonRadioGroup, IonRadio, IonCheckbox, IonCardHeader, IonCardTitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, personOutline, mapOutline, cashOutline, cardOutline, alertCircleOutline, starOutline, addOutline, removeOutline, checkmarkCircle } from 'ionicons/icons';
import { CartService } from '../services/cart.service';
import { DataService } from '../services/data.service';
import { AuthService, User } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
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
    IonRadioGroup, IonRadio, IonCheckbox, IonCardHeader, IonCardTitle
  ]
})
export class RiepilogoPage implements OnInit, AfterViewChecked, OnDestroy {
  cartItems$: Observable<any[]>;
  currentUser$: Observable<User | null>;
  paymentMethod: string = 'contanti';
  deliveryFee: number = 1.99;
  usePoints: boolean = false;
  pointsToUse: number = 0;
  
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
    private toastController: ToastController
  ) {
    addIcons({ 
      locationOutline, personOutline, mapOutline, 
      cashOutline, cardOutline, alertCircleOutline, 
      starOutline, addOutline, removeOutline, checkmarkCircle 
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

  getPointsDiscount(user: User | null, items: any[] | null): number {
    if (!this.usePoints || !user || !user.points || !items) return 0;
    
    const subtotal = this.getCartSubtotal(items) + this.deliveryFee;
    const maxDiscountPossible = subtotal - 1; // Deve rimanere almeno 1 euro
    
    if (maxDiscountPossible <= 0) return 0;

    const discountFromPoints = Math.floor(user.points / 10);
    return Math.min(discountFromPoints, maxDiscountPossible);
  }

  getFinalTotal(user: User | null, items: any[] | null) {
    const subtotal = this.getCartSubtotal(items);
    const discount = this.getPointsDiscount(user, items);
    return subtotal + this.deliveryFee - discount;
  }

  async confirmOrder() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      // Calcoliamo lo sconto effettivo basato sui punti
      this.cartItems$.pipe(take(1)).subscribe(items => {
        const discount = this.getPointsDiscount(user, items);
        
        this.cartService.checkout(discount).subscribe({
          next: async () => {
            // Se sono stati usati punti, scaliamoli
            if (this.usePoints && user && user.id && user.points !== undefined) {
              const usedPoints = discount * 10;
              this.authService.updateUser(user.id, { points: user.points - usedPoints }).subscribe();
            }

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
