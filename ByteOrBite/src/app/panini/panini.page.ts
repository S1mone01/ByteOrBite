import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DataService } from '../services/data.service';
import { CartService } from '../services/cart.service';
import { Subscription } from 'rxjs';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonButton, IonIcon, 
  IonText, IonBadge, IonImg, IonModal, IonList, IonItem, IonLabel, IonCheckbox,
  IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cartOutline, add, remove, close, cart, removeCircleOutline, addCircleOutline, 
  trash, trashOutline, checkmarkCircleOutline, layersOutline, closeCircle,
  flameOutline, leafOutline, nutritionOutline, fastFoodOutline
} from 'ionicons/icons';
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
    IonCardTitle, IonCardContent, IonButton, IonIcon, 
    IonText, IonBadge, IonImg, IonModal, IonList, IonItem, IonLabel, IonCheckbox, IonButtons
  ],
})
export class PaniniPage implements OnInit, OnDestroy {

  panini: any[] = [];
  cartQuantities: { [key: number]: number } = {};
  isModalOpen = false;
  selectedPanino: any = null;
  allIngredienti: any[] = [];
  ingredientiBase: any[] = [];
  ingredientiExtra: any[] = [];
  cartItems: any[] = [];
  private cartItemsSub: Subscription | null = null;

  constructor(
    private dataService: DataService,
    private cartService: CartService
  ) {
    addIcons({ 
      add, remove, close, cart, removeCircleOutline, addCircleOutline, 
      trash, trashOutline, checkmarkCircleOutline, layersOutline, closeCircle,
      flameOutline, leafOutline, nutritionOutline, fastFoodOutline 
    });
  }

  ngOnInit() {
    this.caricaPanini();
    this.caricaIngredienti();
    this.cartItemsSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.aggiornaQuantitaLocali(items);
    });
  }

  ngOnDestroy() {
    if (this.cartItemsSub) this.cartItemsSub.unsubscribe();
  }

  aggiornaQuantitaLocali(items: any[]) {
    // Reset quantita
    Object.keys(this.cartQuantities).forEach(key => this.cartQuantities[+key] = 0);
    
    // Conteggia tutti i panini presenti nel carrello con lo stesso nome, sia base che personalizzati
    items.forEach(item => {
      const panino = this.panini.find(p => p.nome === item.prodotto_nome);
      if (panino) {
        this.cartQuantities[panino.id] = (this.cartQuantities[panino.id] || 0) + item.quantita;
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
      modifiche: '' // Version base dalla card
    });
  }

  decrementQuantity(panino: any, event?: Event) {
    if (event) event.stopPropagation();
    const matchingItems = this.cartItems.filter(i => i.prodotto_nome === panino.nome);
    
    if (matchingItems.length > 0) {
      const itemToDecrement = matchingItems[matchingItems.length - 1];
      this.cartService.updateQuantity(itemToDecrement.id, itemToDecrement.quantita - 1);
    }
  }

  openDetails(panino: any) {
    this.selectedPanino = { ...panino };
    const baseIds = panino.ingredienti || [];
    
    // Separa gli ingredienti base dell'oggetto dagli ingredienti aggiuntivi
    this.ingredientiBase = this.allIngredienti
      .filter(ing => baseIds.includes(ing.id))
      .map(ing => ({ ...ing, isBase: true, checked: true }));

    this.ingredientiExtra = this.allIngredienti
      .filter(ing => !baseIds.includes(ing.id))
      .map(ing => ({ ...ing, isBase: false, checked: false }));

    this.isModalOpen = true;
  }

  closeDetails() {
    this.isModalOpen = false;
    this.selectedPanino = null;
    this.ingredientiBase = [];
    this.ingredientiExtra = [];
  }

  getActiveIngredients() {
    return [
      ...this.ingredientiBase.filter(ing => ing.checked),
      ...this.ingredientiExtra.filter(ing => ing.checked)
    ];
  }

  trackByIngId(index: number, item: any) {
    return item.id;
  }

  getLayerClass(nome: string): string {
    if (!nome) return 'layer-generic';
    const n = nome.toLowerCase();
    if (n.includes('carne') || n.includes('hamburger') || n.includes('bacon')) return 'layer-carne';
    if (n.includes('formaggio') || n.includes('cheddar') || n.includes('scamorza')) return 'layer-formaggio';
    if (n.includes('insalata') || n.includes('lattuga') || n.includes('rucola')) return 'layer-insalata';
    if (n.includes('pomodoro')) return 'layer-pomodoro';
    if (n.includes('salsa') || n.includes('maionese') || n.includes('ketchup') || n.includes('bbq')) return 'layer-salsa';
    return 'layer-generic';
  }

  getIngredientIcon(nome: string): string {
    if (!nome) return 'fast-food-outline';
    const n = nome.toLowerCase();
    if (n.includes('carne') || n.includes('hamburger') || n.includes('bacon')) return 'flame-outline';
    if (n.includes('insalata') || n.includes('lattuga') || n.includes('pomodoro')) return 'leaf-outline';
    if (n.includes('formaggio') || n.includes('cheddar')) return 'nutrition-outline';
    return 'fast-food-outline';
  }

  addSelectedToCart() {
    if (!this.selectedPanino) return;

    // Rimozione degli ingredienti base deselezionati
    const removed = this.ingredientiBase
      .filter(ing => !ing.checked)
      .map(ing => `-${ing.nome}`);

    // Aggiunta degli ingredienti extra selezionati
    const added = this.ingredientiExtra
      .filter(ing => ing.checked)
      .map(ing => `+${ing.nome}`);
    
    const modifiche = [...added, ...removed].join(', ');

    // Calcolo del prezzo finale: gli ingredienti base non aggiungono costi extra
    let prezzoFinale = this.selectedPanino.prezzo;
    this.ingredientiExtra.forEach(ing => {
      if (ing.checked) {
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

  getImageUrl(path: string) {
    if (!path) return 'assets/1024v5.png';
    if (path.startsWith('http') || path.startsWith('assets/')) {
      return path;
    }
    return `${this.dataService.getApiUrl()}/${path}`;
  }
}

