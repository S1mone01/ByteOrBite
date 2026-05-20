import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, 
  IonHeader, IonToolbar, IonButtons, IonButton,
  IonMenuButton, IonPopover, IonList, IonItem,
  IonContent, IonBadge, IonModal, IonFooter, IonThumbnail, IonTitle,
  IonFab, IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, fastFoodOutline, personOutline, 
  sunnyOutline, moonOutline, logOutOutline, personCircleOutline,
  starOutline, settingsOutline, cartOutline, cart, close, removeCircleOutline, addCircleOutline
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

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private cartService: CartService,
    private dataService: DataService,
    private router: Router
  ) {
    addIcons({ 
      homeOutline, fastFoodOutline, personOutline, 
      sunnyOutline, moonOutline, logOutOutline, personCircleOutline,
      starOutline, settingsOutline, cartOutline, cart, close, removeCircleOutline, addCircleOutline
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
  }

  ngOnInit() {
  }

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
    this.cartService.updateQuantity(item.id, item.quantita + delta);
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
