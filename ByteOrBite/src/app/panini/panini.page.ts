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
  IonButtons, IonFab, IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline, add, remove, close, cart } from 'ionicons/icons';
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
    IonFab, IonFabButton
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
  private cartSub: Subscription | null = null;

  constructor(
    private dataService: DataService,
    private cartService: CartService
  ) {
    addIcons({ cartOutline, add, remove, close, cart });
  }

  ngOnInit() {
    this.caricaPanini();
    this.caricaIngredienti();
    this.cartSub = this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  ngOnDestroy() {
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
  }

  caricaPanini() {
    this.dataService.getPanini().subscribe({
      next: (data) => {
        this.panini = data;
        this.panini.forEach(p => {
          if (!this.cartQuantities[p.id]) {
            this.cartQuantities[p.id] = 0;
          }
        });
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
    this.cartQuantities[panino.id]++;
    this.cartService.addToCart({
      ...panino,
      quantita: 1,
      modifiche: '' // Default version from the card
    });
  }

  decrementQuantity(panino: any, event?: Event) {
    if (event) event.stopPropagation();
    if (this.cartQuantities[panino.id] > 0) {
      this.cartQuantities[panino.id]--;
      // Implement decrement in cartService if needed, for now we just add
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

  getImageUrl(path: string) {
    if (!path) return 'assets/1024v5.png';
    if (path.startsWith('http') || path.startsWith('assets/')) {
      return path;
    }
    return `${this.dataService.getApiUrl()}/${path}`;
  }
}
