import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { DataService } from './data.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  private isCartModalOpenSubject = new BehaviorSubject<boolean>(false);
  public isCartModalOpen$ = this.isCartModalOpenSubject.asObservable();

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadCart(user.id);
      } else {
        this.cartItemsSubject.next([]);
        this.cartCountSubject.next(0);
      }
    });
  }

  loadCart(userId: string) {
    this.dataService.getCarrello(userId).subscribe({
      next: (items) => {
        this.cartItemsSubject.next(items);
        this.updateCartCount(items);
      },
      error: (err) => console.error('Errore nel caricamento del carrello:', err)
    });
  }

  addToCart(item: any) {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      console.warn('Utente non loggato, impossibile aggiungere al carrello');
      return;
    }

    // Cerca se esiste già un elemento identico nel carrello (stesso nome e stesse modifiche)
    const existingItem = this.cartItemsSubject.value.find(
      i => i.prodotto_nome === item.nome && i.modifiche === (item.modifiche || '')
    );

    if (existingItem) {
      this.updateQuantity(existingItem.id, existingItem.quantita + 1);
    } else {
      const cartItem = {
        utente_id: currentUser.id,
        prodotto_nome: item.nome,
        quantita: item.quantita || 1,
        prezzo_unitario: item.prezzo,
        modifiche: item.modifiche || '',
        tipo_prodotto: item.tipo || 'panino',
        immagine_url: item.immagine_url
      };

      this.dataService.addToCarrello(cartItem).subscribe({
        next: () => this.loadCart(currentUser.id),
        error: (err) => console.error('Errore nell\'aggiunta al carrello:', err)
      });
    }
  }

  updateQuantity(id: number, quantita: number) {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    if (quantita <= 0) {
      this.removeFromCart(id);
    } else {
      this.dataService.updateCarrelloItem(id, quantita).subscribe({
        next: () => this.loadCart(currentUser.id),
        error: (err) => console.error('Errore nell\'aggiornamento della quantità:', err)
      });
    }
  }

  removeFromCart(id: number) {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    this.dataService.removeFromCarrello(id).subscribe({
      next: () => this.loadCart(currentUser.id),
      error: (err) => console.error('Errore nella rimozione dal carrello:', err)
    });
  }

  setCartModalOpen(isOpen: boolean) {
    this.isCartModalOpenSubject.next(isOpen);
  }

  private updateCartCount(items: any[]) {
    const count = items.reduce((acc, item) => acc + item.quantita, 0);
    this.cartCountSubject.next(count);
  }
}
