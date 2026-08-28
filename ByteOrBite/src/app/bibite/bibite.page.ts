import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { CartService } from 'src/app/services/cart.service';
import { Subscription } from 'rxjs';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonButton, IonIcon, 
  IonText, IonBadge, IonImg
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cartOutline, add, remove, close, cart, trash
} from 'ionicons/icons';

@Component({
  selector: 'app-bibite',
  templateUrl: 'bibite.page.html',
  styleUrls: ['bibite.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonButton, IonIcon, 
    IonText, IonBadge, IonImg
  ]
})
export class BibitePage implements OnInit, OnDestroy {
  listaBibite: any[] = [];
  
  cartQuantities: { [key: number]: number } = {};
  
  cartItems: any[] = [];
  private cartItemsSub: Subscription | null = null;

  constructor(
    private dataService: DataService,
    private cartService: CartService
  ) { 
    addIcons({ 
      cartOutline, add, remove, close, cart, trash
    });
  }

  ngOnInit() {
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
      const bibita = this.listaBibite.find(m => m.nome === item.prodotto_nome);
      if (bibita) {
        this.cartQuantities[bibita.id] = (this.cartQuantities[bibita.id] || 0) + item.quantita;
      }
    });
  }

  caricaBibite() {
    this.dataService.getBibite().subscribe({
      next: (dati) => {
        this.listaBibite = dati;
        this.listaBibite.forEach(m => {
          if (this.cartQuantities[m.id] === undefined) {
            this.cartQuantities[m.id] = 0;
          }
        });
        this.aggiornaQuantitaLocali(this.cartItems);
      },
      error: (err) => {
        console.error('Errore nel caricamento delle bibite:', err);
      }
    });
  }

  incrementQuantity(bibita: any, event?: Event) {
    if (event) event.stopPropagation();
    this.cartService.addToCart({
      ...bibita,
      tipo: 'bibita',
      quantita: 1,
      modifiche: ''
    });
  }

  decrementQuantity(bibita: any, event?: Event) {
    if (event) event.stopPropagation();
    const existingItem = this.cartItems.find(
      i => i.prodotto_nome === bibita.nome
    );
    
    if (existingItem) {
      this.cartService.updateQuantity(existingItem.id, existingItem.quantita - 1);
    }
  }

  getImageUrl(path: string) {
    if (!path) return 'assets/1024v5.png';
    if (path.startsWith('http') || path.startsWith('assets/')) {
      return path;
    }
    return `${this.dataService.getApiUrl()}/${path}`;
  }
}
