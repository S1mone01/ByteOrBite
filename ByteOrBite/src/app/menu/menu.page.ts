import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { CartService } from 'src/app/services/cart.service';
import { Subscription } from 'rxjs';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonButton, IonIcon, 
  IonText, IonBadge, IonImg, IonModal, IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline, add, remove, close, cart, removeCircleOutline, addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-menu',
  templateUrl: 'menu.page.html',
  styleUrls: ['menu.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonButton, IonIcon, 
    IonText, IonBadge, IonImg, IonModal, IonButtons
  ]
})
export class MenuPage implements OnInit, OnDestroy {
  listaMenu: any[] = [];
  cartQuantities: { [key: number]: number } = {};
  isModalOpen = false;
  selectedMenu: any = null;
  cartItems: any[] = [];
  private cartItemsSub: Subscription | null = null;

  constructor(
    private dataService: DataService,
    private cartService: CartService
  ) { 
    addIcons({ cartOutline, add, remove, close, cart, removeCircleOutline, addCircleOutline });
  }

  ngOnInit() {
    this.caricaMenuCombo();
    this.cartItemsSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.aggiornaQuantitaLocali(items);
    });
  }

  ngOnDestroy() {
    if (this.cartItemsSub) this.cartItemsSub.unsubscribe();
  }

  aggiornaQuantitaLocali(items: any[]) {
    Object.keys(this.cartQuantities).forEach(key => this.cartQuantities[+key] = 0);
    
    items.forEach(item => {
      const menu = this.listaMenu.find(m => m.nome === item.prodotto_nome);
      if (menu) {
        this.cartQuantities[menu.id] = (this.cartQuantities[menu.id] || 0) + item.quantita;
      }
    });
  }

  caricaMenuCombo() {
    this.dataService.getMenu().subscribe({
      next: (dati) => {
        this.listaMenu = dati;
        this.listaMenu.forEach(m => {
          if (this.cartQuantities[m.id] === undefined) {
            this.cartQuantities[m.id] = 0;
          }
        });
        this.aggiornaQuantitaLocali(this.cartItems);
      },
      error: (err) => {
        console.error('Errore nel caricamento dei menu:', err);
      }
    });
  }

  incrementQuantity(combo: any, event?: Event) {
    if (event) event.stopPropagation();
    this.cartService.addToCart({
      ...combo,
      tipo: 'menu',
      quantita: 1,
      modifiche: ''
    });
  }

  decrementQuantity(combo: any, event?: Event) {
    if (event) event.stopPropagation();
    const existingItem = this.cartItems.find(
      i => i.prodotto_nome === combo.nome
    );
    
    if (existingItem) {
      this.cartService.updateQuantity(existingItem.id, existingItem.quantita - 1);
    }
  }

  openDetails(combo: any) {
    this.selectedMenu = { ...combo };
    this.isModalOpen = true;
  }

  closeDetails() {
    this.isModalOpen = false;
    this.selectedMenu = null;
  }

  addSelectedToCart() {
    if (!this.selectedMenu) return;

    this.cartService.addToCart({
      ...this.selectedMenu,
      tipo: 'menu',
      quantita: 1,
      modifiche: ''
    });

    this.closeDetails();
  }

  getImageUrl(path: string) {
    if (!path) return 'assets/1024v5.png';
    if (path.startsWith('http') || path.startsWith('assets/')) {
      return path;
    }
    return `${this.dataService.getApiUrl()}/${path}`;
  }
}