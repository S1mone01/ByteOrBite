import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonSegment, IonSegmentButton, 
  IonLabel, IonList, IonItem, IonThumbnail, IonButton, IonIcon, IonModal, 
  IonButtons, IonInput, IonToggle, IonSelect, IonSelectOption, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonListHeader,
  IonCardSubtitle, IonText, AlertController, ToastController,
  IonGrid, IonRow, IonCol, IonFab, IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  add, pencil, trash, close, save, 
  chevronDownOutline, chevronUpOutline, eyeOutline 
} from 'ionicons/icons';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.page.html',
  styleUrls: ['./manage.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonSegment, IonSegmentButton, 
    IonLabel, IonList, IonItem, IonThumbnail, IonButton, IonIcon, IonModal, 
    IonButtons, IonInput, IonToggle, IonSelect, IonSelectOption, IonCard, 
    IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonListHeader, 
    IonCardSubtitle, IonText, IonGrid, IonRow, IonCol, IonFab, IonFabButton,
    CommonModule, FormsModule
  ]
})
export class ManagePage implements OnInit {
  segmentValue = 'panini';
  panini: any[] = [];
  bibite: any[] = [];
  patatine: any[] = [];
  menu: any[] = [];
  ingredienti: any[] = [];
  ordini: any[] = [];

  isOrdersVisible = true;
  isModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  currentItem: any = {};

  constructor(
    private dataService: DataService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ 
      add, pencil, trash, close, save, 
      chevronDownOutline, chevronUpOutline, eyeOutline 
    });
  }

  ngOnInit() {
    this.loadAllData();
    this.loadOrdini();
  }

  toggleOrders() {
    this.isOrdersVisible = !this.isOrdersVisible;
  }

  loadAllData() {
    this.dataService.getPanini().subscribe({
      next: (res) => this.panini = res,
      error: (err) => this.showToast('Errore nel caricamento dei panini', 'danger')
    });
    this.dataService.getBibite().subscribe({
      next: (res) => this.bibite = res,
      error: (err) => this.showToast('Errore nel caricamento delle bibite', 'danger')
    });
    this.dataService.getPatatine().subscribe({
      next: (res) => this.patatine = res,
      error: (err) => this.showToast('Errore nel caricamento delle patatine', 'danger')
    });
    this.dataService.getMenu().subscribe({
      next: (res) => this.menu = res,
      error: (err) => this.showToast('Errore nel caricamento dei menu', 'danger')
    });
    this.dataService.getIngredienti().subscribe({
      next: (res) => this.ingredienti = res,
      error: (err) => this.showToast('Errore nel caricamento degli ingredienti', 'danger')
    });
  }

  loadOrdini() {
    this.dataService.getOrdini().subscribe({
      next: (res) => this.ordini = res,
      error: (err) => this.showToast('Errore nel caricamento degli ordini', 'danger')
    });
  }

  isOrderModalOpen = false;
  currentOrder: any = {};

  openEditOrderModal(ordine: any) {
    this.currentOrder = { ...ordine };
    this.isOrderModalOpen = true;
  }

  closeOrderModal() {
    this.isOrderModalOpen = false;
  }

  saveOrder() {
    this.dataService.updateOrdine(this.currentOrder.id, this.currentOrder).subscribe({
      next: () => {
        this.showToast('Ordine aggiornato con successo');
        this.loadOrdini();
        this.closeOrderModal();
      },
      error: (err) => this.showToast('Errore durante l\'aggiornamento dell\'ordine', 'danger')
    });
  }

  updateStatoOrdine(id: number, nuovoStato: any) {
    const ordine = this.ordini.find(o => o.id === id);
    if (ordine) {
      const updatedData = { ...ordine, stato: nuovoStato.detail.value };
      this.dataService.updateOrdine(id, updatedData).subscribe({
        next: () => {
          this.showToast('Stato ordine aggiornato');
          this.loadOrdini();
        },
        error: (err) => this.showToast('Errore durante l\'aggiornamento dello stato', 'danger')
      });
    }
  }

  async confirmDeleteOrder(id: number) {
    const alert = await this.alertController.create({
      header: 'Conferma eliminazione',
      message: 'Sei sicuro di voler eliminare questo ordine? L\'azione è irreversibile.',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: () => {
            this.deleteOrdine(id);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteOrdine(id: number) {
    this.dataService.deleteOrdine(id).subscribe({
      next: () => {
        this.showToast('Ordine eliminato');
        this.loadOrdini();
      },
      error: (err) => this.showToast('Errore durante l\'eliminazione dell\'ordine', 'danger')
    });
  }

  openAddModal() {
    this.modalMode = 'add';
    this.currentItem = { disponibile: 1 };
    if (this.segmentValue === 'panini') this.currentItem.ingredienti = [];
    this.isModalOpen = true;
  }

  openEditModal(item: any) {
    this.modalMode = 'edit';
    this.currentItem = { ...item };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveItem() {
    const obs = this.getObservable();
    if (obs) {
      obs.subscribe({
        next: () => {
          this.showToast(`${this.segmentValue.charAt(0).toUpperCase() + this.segmentValue.slice(1)} salvato con successo`);
          this.loadAllData();
          this.closeModal();
        },
        error: (err) => this.showToast(`Errore durante il salvataggio: ${err.error?.message || 'Errore generico'}`, 'danger')
      });
    }
  }

  getObservable() {
    const id = this.currentItem.id;
    const val = this.segmentValue;
    if (this.modalMode === 'add') {
      if (val === 'panini') return this.dataService.addPanino(this.currentItem);
      if (val === 'bibite') return this.dataService.addBibita(this.currentItem);
      if (val === 'patatine') return this.dataService.addPatatine(this.currentItem);
      if (val === 'menu') return this.dataService.addMenu(this.currentItem);
      if (val === 'ingredienti') return this.dataService.addIngrediente(this.currentItem);
    } else {
      if (val === 'panini') return this.dataService.updatePanino(id, this.currentItem);
      if (val === 'bibite') return this.dataService.updateBibita(id, this.currentItem);
      if (val === 'patatine') return this.dataService.updatePatatine(id, this.currentItem);
      if (val === 'menu') return this.dataService.updateMenu(id, this.currentItem);
      if (val === 'ingredienti') return this.dataService.updateIngrediente(id, this.currentItem);
    }
    return null;
  }

  async confirmDeleteItem(item: any) {
    const alert = await this.alertController.create({
      header: 'Conferma eliminazione',
      message: `Sei sicuro di voler eliminare "${item.nome}"? L\'azione è irreversibile.`,
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: () => {
            this.deleteItem(item);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteItem(item: any) {
    let obs;
    const val = this.segmentValue;
    if (val === 'panini') obs = this.dataService.deletePanino(item.id);
    if (val === 'bibite') obs = this.dataService.deleteBibita(item.id);
    if (val === 'patatine') obs = this.dataService.deletePatatine(item.id);
    if (val === 'menu') obs = this.dataService.deleteMenu(item.id);
    if (val === 'ingredienti') obs = this.dataService.deleteIngrediente(item.id);

    if (obs) {
      obs.subscribe({
        next: () => {
          this.showToast('Elemento eliminato');
          this.loadAllData();
        },
        error: (err) => this.showToast('Errore durante l\'eliminazione', 'danger')
      });
    }
  }

  toggleAvailability(item: any) {
    const oldVal = item.disponibile;
    item.disponibile = item.disponibile === 1 ? 0 : 1;
    
    const id = item.id;
    const val = this.segmentValue;
    let obs;
    
    if (val === 'panini') obs = this.dataService.updatePanino(id, item);
    if (val === 'bibite') obs = this.dataService.updateBibita(id, item);
    if (val === 'patatine') obs = this.dataService.updatePatatine(id, item);
    if (val === 'menu') obs = this.dataService.updateMenu(id, item);
    if (val === 'ingredienti') obs = this.dataService.updateIngrediente(id, item);
    
    if (obs) {
      obs.subscribe({
        next: () => this.showToast('Disponibilità aggiornata'),
        error: (err) => {
          console.error("Errore aggiornamento disponibilità", err);
          this.showToast('Errore aggiornamento disponibilità', 'danger');
          item.disponibile = oldVal;
        }
      });
    }
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
