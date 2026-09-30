import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { CartService } from 'src/app/services/cart.service';
import { Subscription } from 'rxjs';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonButton, IonIcon, 
  IonText, IonBadge, IonImg, IonModal, IonButtons,
  ModalController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cartOutline, add, remove, close, cart, removeCircleOutline, 
  addCircleOutline, fastFoodOutline, wineOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: 'menu.page.html',
  styleUrls: ['menu.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonButton, IonIcon, 
    IonText, IonBadge, IonImg, IonModal, IonButtons
  ]
})
export class MenuPage implements OnInit, OnDestroy {
  listaMenu: any[] = [];
  listaPatatine: any[] = [];
  listaBibite: any[] = [];
  
  cartQuantities: { [key: number]: number } = {};
  isModalOpen = false;
  selectedMenu: any = null;
  selectedPatatina: any = null;
  selectedBibita: any = null;
  modalQuantity: number = 1;
  
  cartItems: any[] = [];
  private cartItemsSub: Subscription | null = null;

  constructor(
    private dataService: DataService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private modalController: ModalController,
    private toastController: ToastController
  ) { 
    addIcons({ 
      cartOutline, add, remove, close, cart, 
      removeCircleOutline, addCircleOutline, 
      fastFoodOutline, wineOutline, checkmarkCircleOutline 
    });
  }

  ngOnInit() {
    this.caricaMenuCombo();
    this.caricaPatatine();
    this.caricaBibite();
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

  caricaPatatine() {
    this.dataService.getPatatine().subscribe({
      next: (dati) => {
        this.listaPatatine = dati.filter(p => p.disponibile != 0);
      },
      error: (err) => console.error('Errore caricamento patatine:', err)
    });
  }

  caricaBibite() {
    this.dataService.getBibite().subscribe({
      next: (dati) => {
        this.listaBibite = dati.filter(b => b.disponibile != 0);
      },
      error: (err) => console.error('Errore caricamento bibite:', err)
    });
  }

  incrementQuantity(combo: any, event?: Event) {
    if (event) event.stopPropagation();
    this.openDetails(combo);
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
    this.modalQuantity = 1;
    
    // Seleziona la patatina predefinita se presente nel combo, altrimenti la prima disponibile
    if (combo.patatine_id) {
      this.selectedPatatina = this.listaPatatine.find(p => p.id === combo.patatine_id) || this.listaPatatine[0] || null;
    } else {
      this.selectedPatatina = this.listaPatatine[0] || null;
    }

    // Seleziona la bibita predefinita se presente nel combo, altrimenti la prima disponibile
    if (combo.bibite_id) {
      this.selectedBibita = this.listaBibite.find(b => b.id === combo.bibite_id) || this.listaBibite[0] || null;
    } else {
      this.selectedBibita = this.listaBibite[0] || null;
    }

    this.isModalOpen = true;
  }

  closeDetails() {
    this.isModalOpen = false;
    setTimeout(() => {
      if (!this.isModalOpen) {
        this.selectedMenu = null;
        this.selectedPatatina = null;
        this.selectedBibita = null;
        this.modalQuantity = 1;
      }
    }, 300);
  }

  incrementModalQuantity() {
    this.modalQuantity++;
  }

  decrementModalQuantity() {
    if (this.modalQuantity > 1) {
      this.modalQuantity--;
    }
  }

  selectPatatina(patatina: any) {
    this.selectedPatatina = patatina;
  }

  selectBibita(bibita: any) {
    this.selectedBibita = bibita;
  }

  calculateTotalPrice(): number {
    if (!this.selectedMenu) return 0;
    let total = this.selectedMenu.prezzo || 0;
    if (this.selectedPatatina && this.selectedPatatina.sovrapprezzo) {
      total += this.selectedPatatina.sovrapprezzo;
    }
    if (this.selectedBibita && this.selectedBibita.sovrapprezzo) {
      total += this.selectedBibita.sovrapprezzo;
    }
    return total;
  }

  async addSelectedToCart() {
    if (!this.selectedMenu) return;

    if (!this.authService.isLoggedIn()) {
      this.closeDetails();
      try {
        const topModal = await this.modalController.getTop();
        if (topModal) {
          await topModal.dismiss();
        }
      } catch (e) {}
      await this.router.navigate(['/tabs/login']);
      const toast = await this.toastController.create({
        message: 'Accedi per completare il tuo ordine',
        duration: 2500,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    const modificheList: string[] = [];
    if (this.selectedPatatina) {
      modificheList.push(`Starter: ${this.selectedPatatina.nome}`);
    }
    if (this.selectedBibita) {
      modificheList.push(`Bibita: ${this.selectedBibita.nome}`);
    }

    const modificheStr = modificheList.join(', ');
    const prezzoFinale = this.calculateTotalPrice();

    this.cartService.addToCart({
      ...this.selectedMenu,
      prezzo: prezzoFinale,
      tipo: 'menu',
      quantita: this.modalQuantity,
      modifiche: modificheStr
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
