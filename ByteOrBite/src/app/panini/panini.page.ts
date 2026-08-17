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
  extraQuantities: { [key: number]: number } = {};
  hasBunTop: boolean = true;
  hasBunBottom: boolean = true;
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

  isBun(nome: string): boolean {
    if (!nome) return false;
    const n = nome.toLowerCase();
    return n.includes('pane superiore') || n.includes('pane inferiore') || n === 'pane';
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
          if (p.disponibile_db === undefined) {
            p.disponibile_db = p.disponibile;
          }
          if (this.cartQuantities[p.id] === undefined) {
            this.cartQuantities[p.id] = 0;
          }
        });
        this.calcolaDisponibilitaPanini();
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
        this.calcolaDisponibilitaPanini();
      }
    });
  }

  calcolaDisponibilitaPanini() {
    if (!this.panini || !this.panini.length || !this.allIngredienti || !this.allIngredienti.length) return;

    this.panini.forEach(panino => {
      if (panino.disponibile_db === undefined) {
        panino.disponibile_db = panino.disponibile;
      }

      // Se il panino stesso è segnato come non disponibile nel DB
      if (panino.disponibile_db == 0) {
        panino.disponibile = 0;
        return;
      }

      // Se almeno uno degli ingredienti base del panino non è disponibile, rende il panino non disponibile
      const baseIds = panino.ingredienti || [];
      const haIngredienteNonDisponibile = baseIds.some((ingId: any) => {
        const ing = this.allIngredienti.find(i => i.id == ingId);
        return ing && (ing.disponibile == 0 || ing.disponibile === false);
      });

      if (haIngredienteNonDisponibile) {
        panino.disponibile = 0;
      } else {
        panino.disponibile = panino.disponibile_db;
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
    
    this.hasBunTop = true;
    this.hasBunBottom = true;

    // Inizializza quantita extra per tutti gli ingredienti a 0
    this.extraQuantities = {};
    this.allIngredienti.forEach(ing => {
      this.extraQuantities[ing.id] = 0;
    });

    // Gli ingredienti base del panino (inclusi nel prezzo base)
    this.ingredientiBase = this.allIngredienti
      .filter(ing => baseIds.includes(ing.id))
      .map(ing => {
        const isTop = ing.nome.toLowerCase().includes('pane superiore');
        const isBottom = ing.nome.toLowerCase().includes('pane inferiore');
        return {
          ...ing,
          isBase: true,
          checked: true,
          isBunTop: isTop,
          isBunBottom: isBottom
        };
      });

    // Sincronizza stato pani se presenti negli ingredienti base da DB
    const topIng = this.ingredientiBase.find(i => i.isBunTop);
    if (topIng) this.hasBunTop = topIng.checked;
    const bottomIng = this.ingredientiBase.find(i => i.isBunBottom);
    if (bottomIng) this.hasBunBottom = bottomIng.checked;

    // Tutti gli ingredienti disponibili per aggiunta extra (esclusi pane superiore e inferiore)
    this.ingredientiExtra = this.allIngredienti
      .filter(ing => !this.isBun(ing.nome))
      .map(ing => ({ ...ing, isBase: false }));

    this.isModalOpen = true;
  }

  closeDetails() {
    this.isModalOpen = false;
    this.selectedPanino = null;
    this.ingredientiBase = [];
    this.ingredientiExtra = [];
    this.extraQuantities = {};
    this.hasBunTop = true;
    this.hasBunBottom = true;
  }

  toggleBunTop() {
    this.hasBunTop = !this.hasBunTop;
    const topIng = this.ingredientiBase.find(i => i.isBunTop || i.nome.toLowerCase().includes('pane superiore'));
    if (topIng) {
      topIng.checked = this.hasBunTop;
    }
  }

  toggleBunBottom() {
    this.hasBunBottom = !this.hasBunBottom;
    const bottomIng = this.ingredientiBase.find(i => i.isBunBottom || i.nome.toLowerCase().includes('pane inferiore'));
    if (bottomIng) {
      bottomIng.checked = this.hasBunBottom;
    }
  }

  incrementExtra(ing: any) {
    if (ing.disponibile == 0) return;
    this.extraQuantities[ing.id] = (this.extraQuantities[ing.id] || 0) + 1;
  }

  decrementExtra(ing: any) {
    if ((this.extraQuantities[ing.id] || 0) > 0) {
      this.extraQuantities[ing.id]--;
    }
  }

  getActiveIngredients() {
    const result: any[] = [];

    this.allIngredienti.forEach(ing => {
      if (this.isBun(ing.nome)) return; // I pani hanno la vista grafica dedicata in cima e in fondo

      const baseItem = this.ingredientiBase.find(b => b.id === ing.id);
      const hasBase = baseItem && baseItem.checked ? 1 : 0;
      const extraQty = this.extraQuantities[ing.id] || 0;
      const totalQty = hasBase + extraQty;

      if (totalQty > 0) {
        result.push({
          ...ing,
          isBase: hasBase > 0 && extraQty === 0,
          hasBase: hasBase > 0,
          extraQty: extraQty,
          totalQty: totalQty,
          extraPriceTotal: extraQty * (ing.prezzo_extra || 0)
        });
      }
    });

    return result;
  }

  removeIngredientFromStack(ing: any) {
    if (this.extraQuantities[ing.id] && this.extraQuantities[ing.id] > 0) {
      this.extraQuantities[ing.id]--;
    } else {
      const baseItem = this.ingredientiBase.find(b => b.id === ing.id);
      if (baseItem) {
        baseItem.checked = false;
      }
    }
  }

  toggleIngrediente(ing: any) {
    ing.checked = !ing.checked;
    if (ing.isBunTop || ing.nome.toLowerCase().includes('pane superiore')) {
      this.hasBunTop = ing.checked;
    }
    if (ing.isBunBottom || ing.nome.toLowerCase().includes('pane inferiore')) {
      this.hasBunBottom = ing.checked;
    }
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

    const removed: string[] = [];

    // Se il pane superiore o inferiore è stato rimosso
    const hasTopBaseIng = this.ingredientiBase.some(i => i.isBunTop || i.nome.toLowerCase().includes('pane superiore'));
    const hasBottomBaseIng = this.ingredientiBase.some(i => i.isBunBottom || i.nome.toLowerCase().includes('pane inferiore'));

    if (!this.hasBunTop && !hasTopBaseIng) {
      removed.push('-Pane Superiore');
    }
    if (!this.hasBunBottom && !hasBottomBaseIng) {
      removed.push('-Pane Inferiore');
    }

    this.ingredientiBase.forEach(ing => {
      if (!ing.checked) {
        removed.push(`-${ing.nome}`);
      }
    });

    // Aggiunta degli ingredienti extra selezionati con quantita
    const added: string[] = [];
    this.allIngredienti.forEach(ing => {
      if (this.isBun(ing.nome)) return;
      const qty = this.extraQuantities[ing.id] || 0;
      if (qty === 1) {
        added.push(`+${ing.nome}`);
      } else if (qty > 1) {
        added.push(`+${qty}x ${ing.nome}`);
      }
    });

    const modifiche = [...added, ...removed].join(', ');

    // Calcolo del prezzo finale
    let prezzoFinale = this.selectedPanino.prezzo;
    this.allIngredienti.forEach(ing => {
      if (this.isBun(ing.nome)) return;
      const qty = this.extraQuantities[ing.id] || 0;
      if (qty > 0) {
        prezzoFinale += qty * (ing.prezzo_extra || 0);
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

  getImageUrl(path: string) {
    if (!path) return 'assets/1024v5.png';
    if (path.startsWith('http') || path.startsWith('assets/')) {
      return path;
    }
    return `${this.dataService.getApiUrl()}/${path}`;
  }
}

