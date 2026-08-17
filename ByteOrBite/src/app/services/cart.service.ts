import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { DataService } from './data.service';
import { AuthService } from './auth.service';
import { AlertController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

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
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router
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

  async addToCart(item: any) {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      console.warn('Utente non loggato, impossibile aggiungere al carrello');
      const alert = await this.alertController.create({
        header: 'Accesso Richiesto',
        message: 'Devi effettuare il login per aggiungere prodotti al carrello.',
        cssClass: 'modern-alert',
        buttons: [
          { text: 'Annulla', role: 'cancel', cssClass: 'alert-button-cancel' },
          { text: 'Login', cssClass: 'alert-button-confirm', handler: () => this.router.navigate(['/tabs/login']) }
        ]
      });
      await alert.present();
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

  checkout(discount: number = 0, usedPoints: number = 0) {
    const currentUser = this.authService.currentUserValue;
    const items = this.cartItemsSubject.value;
    if (!currentUser || items.length === 0) return new Observable();

    const subtotal = items.reduce((acc, item) => acc + (item.prezzo_unitario * item.quantita), 0);
    const totalToSave = Math.max(0, subtotal - discount); // Salviamo solo il subtotale prodotti (al netto dello sconto)
    const finalTotalForPoints = totalToSave + 1.99; // I punti si calcolano sul totale finale

    const ordineData = {
      utente_id: currentUser.id,
      utente_nome: currentUser.name,
      destinazione: currentUser.location || 'Consegna a domicilio',
      totale: totalToSave,
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
        // Calcola il bilancio netto dei punti: (punti attuali - punti usati per il coupon) + punti guadagnati dall'ordine
        const puntiGuadagnati = Math.floor(finalTotalForPoints / 10);
        const puntiRimanenti = Math.max(0, (currentUser.points || 0) - usedPoints);
        const puntiFinali = puntiRimanenti + puntiGuadagnati;
        
        this.authService.updateUser(currentUser.id, { points: puntiFinali }).subscribe();
      })
    );
  }

  clearCart(userId: string) {
    this.dataService.clearCarrello(userId).subscribe({
      next: () => this.loadCart(userId),
      error: (err) => console.error('Errore nello svuotamento del carrello:', err)
    });
  }

  private updateCartCount(items: any[]) {
    const count = items.reduce((acc, item) => acc + item.quantita, 0);
    this.cartCountSubject.next(count);
  }
}
