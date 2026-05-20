import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DataService } from '../services/data.service';
import { CartService } from '../services/cart.service';
import { Subscription } from 'rxjs';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, 
  IonText, IonBadge, IonImg, IonModal, IonList, IonItem, IonLabel, IonCheckbox,
  IonButtons, IonFab, IonFabButton, IonThumbnail, IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline, add, remove, close, cart, removeCircleOutline, addCircleOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-panini',
  templateUrl: 'panini.page.html',
  styleUrls: ['panini.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, 
    IonText, IonBadge, IonImg, IonModal, IonList, IonItem, IonLabel, IonCheckbox, IonButtons,
    IonFab, IonFabButton, IonThumbnail, IonFooter
  ],
})
export class PaniniPage implements OnInit, OnDestroy {

  panini: any[] = [];
  cartQuantities: { [key: number]: number } = {};
  isModalOpen = false;
  selectedPanino: any = null;
  allIngredienti: any[] = [];
  selectedIngredienti: any[] = [];
  cartCount: number = 0;
  cartItems: any[] = [];
  isCartModalOpen = false;
  private cartSub: Subscription | null = null;
  private cartItemsSub: Subscription | null = null;

  constructor(
    private dataService: DataService,
    private cartService: CartService
  ) {
    addIcons({ cartOutline, add, remove, close, cart, removeCircleOutline, addCircleOutline });
  }

  ngOnInit() {
    this.caricaPanini();
    this.caricaIngredienti();
    this.cartSub = this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
    this.cartItemsSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.aggiornaQuantitaLocali(items);
    });
  }

  ngOnDestroy() {
    if (this.cartSub) this.cartSub.unsubscribe();
    if (this.cartItemsSub) this.cartItemsSub.unsubscribe();
  }

  aggiornaQuantitaLocali(items: any[]) {
    // Reset quantita
    Object.keys(this.cartQuantities).forEach(key => this.cartQuantities[+key] = 0);
    
    // Solo i panini "base" (senza modifiche) vengono mostrati nel selettore della card
    items.forEach(item => {
      if (item.tipo_prodotto === 'panino' && (!item.modifiche || item.modifiche === '')) {
        const panino = this.panini.find(p => p.nome === item.prodotto_nome);
        if (panino) {
          this.cartQuantities[panino.id] = item.quantita;
        }
      }
    });
  }

  caricaPanini() {
    this.dataService.getPanini().subscribe({
      next: (data) => {
        this.panini = data;
        this.panini.forEach(p => {
          if (this.cartQuantities[p.id] === undefined) {
            this.cartQuantities[p.id] = 0;
          }
        });
        // Forza aggiornamento dopo il caricamento dei panini
        this.aggiornaQuantitaLocali(this.cartItems);
      },
      error: (err) => {
        console.error('Errore nel recupero dei panini dal DB:', err);
      }
    });
  }

  caricaIngredienti() {
    this.dataService.getIngredienti().subscribe({
      next: (data) => {
        this.allIngredienti = data;
      }
    });
  }

  incrementQuantity(panino: any, event?: Event) {
    if (event) event.stopPropagation();
    this.cartService.addToCart({
      ...panino,
      quantita: 1,
      modifiche: '' // Default version from the card
    });
  }

  decrementQuantity(panino: any, event?: Event) {
    if (event) event.stopPropagation();
    const existingItem = this.cartItems.find(
      i => i.prodotto_nome === panino.nome && (!i.modifiche || i.modifiche === '')
    );
    
    if (existingItem) {
      this.cartService.updateQuantity(existingItem.id, existingItem.quantita - 1);
    }
  }

  openDetails(panino: any) {
    this.selectedPanino = { ...panino };
    // Mappa gli ingredienti del panino (ids) con gli oggetti completi
    this.selectedIngredienti = this.allIngredienti.map(ing => {
      return {
        ...ing,
        checked: panino.ingredienti.includes(ing.id)
      };
    });
    this.isModalOpen = true;
  }

  closeDetails() {
    this.isModalOpen = false;
    this.selectedPanino = null;
  }

  addSelectedToCart() {
    if (!this.selectedPanino) return;

    // Calcola modifiche (ingredienti aggiunti o rimossi rispetto all'originale)
    const originalIngIds = this.selectedPanino.ingredienti;
    const added = this.selectedIngredienti.filter(ing => ing.checked && !originalIngIds.includes(ing.id)).map(ing => `+${ing.nome}`);
    const removed = this.selectedIngredienti.filter(ing => !ing.checked && originalIngIds.includes(ing.id)).map(ing => `-${ing.nome}`);
    
    const modifiche = [...added, ...removed].join(', ');

    // Calcola il prezzo finale (se vogliamo che il prezzo nel carrello rifletta le modifiche)
    let prezzoFinale = this.selectedPanino.prezzo;
    this.selectedIngredienti.forEach(ing => {
      if (ing.checked && !originalIngIds.includes(ing.id)) {
        prezzoFinale += ing.prezzo_extra;
      }
    });

    this.cartService.addToCart({
      ...this.selectedPanino,
      prezzo: prezzoFinale,
      quantita: 1,
      modifiche: modifiche
    });

    this.closeDetails();
  }

  toggleIngrediente(ing: any) {
    ing.checked = !ing.checked;
  }

  openCart() {
    this.isCartModalOpen = true;
  }

  closeCart() {
    this.isCartModalOpen = false;
  }

  getCartTotal() {
    return this.cartItems.reduce((acc, item) => acc + (item.prezzo_unitario * item.quantita), 0);
  }

  removeFromCart(item: any) {
    this.cartService.removeFromCart(item.id);
  }

  updateCartItemQuantity(item: any, delta: number) {
    this.cartService.updateQuantity(item.id, item.quantita + delta);
  }

  getImageUrl(path: string) {
    if (!path) return 'assets/1024v5.png';
    if (path.startsWith('http') || path.startsWith('assets/')) {
      return path;
    }
    return `${this.dataService.getApiUrl()}/${path}`;
  }
}
