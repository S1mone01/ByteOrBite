import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { DataService } from './data.service';
import { AuthService } from './auth.service';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  public cartCount$ = this.cartItems$.pipe(
    map(items => items.reduce((acc, item) => acc + item.quantita, 0))
  );

  private isCartModalOpenSubject = new BehaviorSubject<boolean>(false);
  public isCartModalOpen$ = this.isCartModalOpenSubject.asObservable();

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private modalController: ModalController,
    private toastController: ToastController,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadCart(user.id);
      } else {
        this.cartItemsSubject.next([]);
      }
    });
  }

  loadCart(userId: string) {
    this.dataService.getCarrello(userId).subscribe({
      next: items => this.cartItemsSubject.next(items),
      error: err => console.error('Errore nel caricamento del carrello:', err)
    });
  }

  async addToCart(item: any) {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      try {
        await (await this.modalController.getTop())?.dismiss();
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

    const existingItem = this.cartItemsSubject.value.find(
      i => i.prodotto_nome === item.nome && i.modifiche === (item.modifiche || '')
    );

    if (existingItem) {
      this.updateQuantity(existingItem.id, existingItem.quantita + (item.quantita || 1));
      return;
    }

    this.reloadAfter(
      this.dataService.addToCarrello({
        utente_id: currentUser.id,
        prodotto_nome: item.nome,
        quantita: item.quantita || 1,
        prezzo_unitario: item.prezzo,
        modifiche: item.modifiche || '',
        tipo_prodotto: item.tipo || 'panino',
        immagine_url: item.immagine_url
      }),
      currentUser.id,
      'Errore nell\'aggiunta al carrello:'
    );
  }

  updateQuantity(id: number, quantita: number) {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    if (quantita <= 0) {
      this.removeFromCart(id);
    } else {
      this.reloadAfter(
        this.dataService.updateCarrelloItem(id, quantita),
        currentUser.id,
        'Errore nell\'aggiornamento della quantità:'
      );
    }
  }

  removeFromCart(id: number) {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    this.reloadAfter(
      this.dataService.removeFromCarrello(id),
      currentUser.id,
      'Errore nella rimozione dal carrello:'
    );
  }

  setCartModalOpen(isOpen: boolean) {
    this.isCartModalOpenSubject.next(isOpen);
  }

  checkout(discount: number = 0, usedPoints: number = 0) {
    const currentUser = this.authService.currentUserValue;
    const items = this.cartItemsSubject.value;
    if (!currentUser || items.length === 0 || !currentUser.location) return new Observable();

    const subtotal = items.reduce((acc, item) => acc + item.prezzo_unitario * item.quantita, 0);
    const totale = Math.max(0, subtotal - discount);

    const ordineData = {
      utente_id: currentUser.id,
      utente_nome: currentUser.name,
      destinazione: currentUser.location,
      totale,
      prodotti: items.map(i => ({
        prodotto_nome: i.prodotto_nome,
        quantita: i.quantita,
        prezzo_unitario: i.prezzo_unitario,
        modifiche: i.modifiche
      }))
    };

    return this.dataService.addOrdine(ordineData).pipe(
      tap(() => {
        this.clearCart(currentUser.id);
        this.setCartModalOpen(false);
        const puntiGuadagnati = Math.floor((totale + 1.99) / 10);
        const puntiRimanenti = Math.max(0, (currentUser.points || 0) - usedPoints);
        this.authService.updateUser(currentUser.id, { points: puntiRimanenti + puntiGuadagnati }).subscribe();
      })
    );
  }

  clearCart(userId: string) {
    this.reloadAfter(
      this.dataService.clearCarrello(userId),
      userId,
      'Errore nello svuotamento del carrello:'
    );
  }

  private reloadAfter(request$: Observable<any>, userId: string, errorMessage: string) {
    request$.subscribe({
      next: () => this.loadCart(userId),
      error: err => console.error(errorMessage, err)
    });
  }
}