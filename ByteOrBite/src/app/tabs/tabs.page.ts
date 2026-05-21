import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, 
  IonHeader, IonToolbar, IonButtons, IonButton,
  IonMenuButton, IonPopover, IonList, IonItem,
  IonContent, IonBadge, IonModal, IonFooter, IonThumbnail, IonTitle,
  IonFab, IonFabButton, ToastController, AlertController, AnimationController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, fastFoodOutline, personOutline, 
  sunnyOutline, moonOutline, logOutOutline, personCircleOutline,
  starOutline, settingsOutline, cartOutline, cart, close, removeCircleOutline, addCircleOutline,
  trash, arrowForwardOutline, removeOutline, addOutline, chevronDownOutline, arrowDownOutline
} from 'ionicons/icons';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { CartService } from '../services/cart.service';
import { DataService } from '../services/data.service';
import { BehaviorSubject, Observable, filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
    IonHeader, IonToolbar, IonButtons, IonButton,
    IonPopover, IonList, IonItem, IonContent,
    IonBadge, IonModal, IonFooter, IonThumbnail, IonTitle,
    IonFab, IonFabButton
  ],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);
  currentUser$: Observable<any>;
  isDarkMode$: Observable<boolean>;
  cartCount$: Observable<number>;
  cartItems$: Observable<any[]>;
  isCartModalOpen$: Observable<boolean>;
  currentUrl$: Observable<string>;
  isDesktop = window.innerWidth >= 768;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private cartService: CartService,
    private dataService: DataService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private animationCtrl: AnimationController
  ) {
    addIcons({ 
      homeOutline, fastFoodOutline, personOutline, 
      sunnyOutline, moonOutline, logOutOutline, personCircleOutline,
      starOutline, settingsOutline, cartOutline, cart, close, removeCircleOutline, addCircleOutline,
      trash, arrowForwardOutline, removeOutline, addOutline, chevronDownOutline, arrowDownOutline
    });
    this.currentUser$ = this.authService.currentUser$;
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.cartCount$ = this.cartService.cartCount$;
    this.cartItems$ = this.cartService.cartItems$;
    this.isCartModalOpen$ = this.cartService.isCartModalOpen$;
    
    this.currentUrl$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: any) => event.urlAfterRedirects),
      startWith(this.router.url)
    );

    // Gestione ridimensionamento per isDesktop
    window.addEventListener('resize', () => {
      this.isDesktop = window.innerWidth >= 768;
    });
  }

  ngOnInit() {
  }

  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot!;
    const isDesktop = window.innerWidth >= 768;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('.modal-wrapper')!)
      .keyframes(isDesktop ? [
        { offset: 0, opacity: '1', transform: 'translateX(100%)' },
        { offset: 1, opacity: '1', transform: 'translateX(0%)' },
      ] : [
        { offset: 0, opacity: '1', transform: 'translateY(100%)' },
        { offset: 1, opacity: '1', transform: 'translateY(0%)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('cubic-bezier(0.32,0.72,0,1)')
      .duration(600) // Aumentato da 400 a 600 per un'animazione più lenta e fluida
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
  }

  openCart() {
    this.cartService.setCartModalOpen(true);
  }

  closeCart() {
    this.cartService.setCartModalOpen(false);
  }

  updateCartItemQuantity(item: any, delta: number) {
    if (item.quantita + delta <= 0) {
      this.confirmRemoveItem(item);
    } else {
      this.cartService.updateQuantity(item.id, item.quantita + delta);
    }
  }

  async confirmRemoveItem(item: any) {
    const alert = await this.alertController.create({
      header: 'Rimuovi dal carrello',
      message: `Sei sicuro di voler rimuovere "${item.prodotto_nome}" dal carrello?`,
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Rimuovi',
          role: 'destructive',
          handler: () => {
            this.cartService.removeFromCart(item.id);
            this.showToast('Elemento rimosso');
          }
        }
      ]
    });

    await alert.present();
  }

  checkout() {
    this.closeCart();
    this.router.navigate(['/tabs/riepilogo']);
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

  getCartTotal(items: any[] | null) {
    if (!items) return 0;
    return items.reduce((acc, item) => acc + (item.prezzo_unitario * item.quantita), 0);
  }

  getImageUrl(path: string) {
    if (!path) return 'assets/1024v5.png';
    if (path.startsWith('http') || path.startsWith('assets/')) {
      return path;
    }
    return `${this.dataService.getApiUrl()}/${path}`;
  }
}
