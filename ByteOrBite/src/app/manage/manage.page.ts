import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonSegment,
  IonSegmentButton, IonLabel, IonList, IonItem, IonThumbnail,
  IonButton, IonIcon, IonModal, IonButtons, IonInput, IonToggle,
  IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonListHeader, IonCardSubtitle, IonText,
  AlertController, ToastController, IonGrid, IonRow, IonCol,
  IonBackButton, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  add, pencil, trash, close, save, chevronDownOutline,
  chevronUpOutline, eyeOutline, arrowBackOutline,
  cloudUploadOutline
} from 'ionicons/icons';

import { DataService } from '../services/data.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.page.html',
  styleUrls: ['./manage.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonSegment, IonSegmentButton, IonLabel, IonList,
    IonItem, IonThumbnail, IonButton, IonIcon, IonModal,
    IonButtons, IonInput, IonToggle, IonSelect,
    IonSelectOption, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonListHeader, IonCardSubtitle,
    IonText, IonGrid, IonRow, IonCol, IonBackButton,
    IonRefresher, IonRefresherContent
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
  isCompletedOrdersVisible = false;
  isInCorsoOrdersVisible = true;

  isModalOpen = false;
  isOrderModalOpen = false;

  modalMode: 'add' | 'edit' = 'add';

  currentItem: any = {};
  currentOrder: any = {};

  get ordiniInCorso() {
    return this.ordini.filter(o => o.stato !== 'completato');
  }

  get ordiniCompletati() {
    return this.ordini.filter(o => o.stato === 'completato');
  }

  constructor(
    private dataService: DataService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      add, pencil, trash, close, save,
      chevronDownOutline, chevronUpOutline,
      eyeOutline, arrowBackOutline, cloudUploadOutline
    });
  }

  ngOnInit() {
    this.loadAllData();
    this.loadOrdini();
  }

  ionViewWillEnter() {
    this.loadAllData();
    this.loadOrdini();
  }

  // IMMAGINI

  getImageUrl(path: string) {
    return this.dataService.getImageUrl(path);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.dataService.uploadImage(file, this.segmentValue).subscribe({
      next: res => {
        this.currentItem.immagine_url = res.url;
        this.showToast('Immagine caricata con successo');
      },
      error: (err: any) => {
        console.error('Errore upload', err);
        this.showToast('Errore durante il caricamento dell\'immagine', 'danger');
      }
    });
  }

  // CARICAMENTO DATI

  loadAllData(event?: any) {
    const requests = [
      { method: 'getPanini', property: 'panini', error: 'Errore nel caricamento dei panini' },
      { method: 'getBibite', property: 'bibite', error: 'Errore nel caricamento delle bibite' },
      { method: 'getPatatine', property: 'patatine', error: 'Errore nel caricamento delle patatine' },
      { method: 'getMenu', property: 'menu', error: 'Errore nel caricamento dei menu' },
      { method: 'getIngredienti', property: 'ingredienti', error: 'Errore nel caricamento degli ingredienti' }
    ];

    requests.forEach(({ method, property, error }) => {
      (this.dataService as any)[method]().subscribe({
        next: (res: any[]) => (this as any)[property] = res,
        error: () => this.showToast(error, 'danger')
      });
    });
  }

  loadOrdini(event?: any) {
    this.dataService.getOrdini().subscribe({
      next: res => {
        this.ordini = res;
        event?.target.complete();
      },
      error: () => {
        this.showToast('Errore nel caricamento degli ordini', 'danger');
        event?.target.complete();
      }
    });
  }

  handleRefresh(event: any) {
    this.loadAllData();
    this.loadOrdini(event);
  }

  // GESTIONE ORDINI

  toggleOrders() {
    this.isOrdersVisible = !this.isOrdersVisible;
  }

  toggleCompletedOrders() {
    this.isCompletedOrdersVisible = !this.isCompletedOrdersVisible;
  }

  toggleInCorsoOrders() {
    this.isInCorsoOrdersVisible = !this.isInCorsoOrdersVisible;
  }

  parseLocation(location: string | undefined): any {
    if (!location) return null;

    try {
      return JSON.parse(location);
    } catch {
      return { address: location };
    }
  }

  openEditOrderModal(ordine: any) {
    this.currentOrder = { ...ordine };

    const location = this.parseLocation(this.currentOrder.destinazione);

    if (location?.address) {
      this.currentOrder.destinazione = location.address;
    }

    this.isOrderModalOpen = true;
  }

  closeOrderModal() {
    this.isOrderModalOpen = false;
  }

  saveOrder() {
    this.dataService.updateOrdine(
      this.currentOrder.id,
      this.currentOrder
    ).subscribe({
      next: () => {
        this.showToast('Ordine aggiornato con successo');
        this.loadOrdini();
        this.closeOrderModal();
      },
      error: () => this.showToast(
        'Errore durante l\'aggiornamento dell\'ordine',
        'danger'
      )
    });
  }

  updateStatoOrdine(id: number, nuovoStato: string) {
    const ordine = this.ordini.find(o => o.id === id);
    if (!ordine) return;

    this.dataService.updateOrdine(id, {
      ...ordine,
      stato: nuovoStato
    }).subscribe({
      next: () => {
        this.showToast('Stato ordine aggiornato');
        this.loadOrdini();
      },
      error: () => this.showToast(
        'Errore durante l\'aggiornamento dello stato',
        'danger'
      )
    });
  }

  async confirmDeleteOrder(id: number) {
    const alert = await this.alertController.create({
      header: 'Conferma eliminazione',
      message: 'Sei sicuro di voler eliminare questo ordine? L\'azione è irreversibile.',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: () => this.deleteOrdine(id)
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
      error: () => this.showToast(
        'Errore durante l\'eliminazione dell\'ordine',
        'danger'
      )
    });
  }

  // GESTIONE PRODOTTI

  openAddModal() {
    this.modalMode = 'add';
    this.currentItem = { disponibile: 1 };

    if (this.segmentValue === 'panini') {
      this.currentItem.ingredienti = [];
    }

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

  getItemObservable(
    action: 'add' | 'update' | 'delete',
    item: any = this.currentItem
  ) {
    const id = item.id;

    const operations: Record<string, any> = {
      panini: {
        add: () => this.dataService.addPanino(item),
        update: () => this.dataService.updatePanino(id, item),
        delete: () => this.dataService.deletePanino(id)
      },
      bibite: {
        add: () => this.dataService.addBibita(item),
        update: () => this.dataService.updateBibita(id, item),
        delete: () => this.dataService.deleteBibita(id)
      },
      patatine: {
        add: () => this.dataService.addPatatine(item),
        update: () => this.dataService.updatePatatine(id, item),
        delete: () => this.dataService.deletePatatine(id)
      },
      menu: {
        add: () => this.dataService.addMenu(item),
        update: () => this.dataService.updateMenu(id, item),
        delete: () => this.dataService.deleteMenu(id)
      },
      ingredienti: {
        add: () => this.dataService.addIngrediente(item),
        update: () => this.dataService.updateIngrediente(id, item),
        delete: () => this.dataService.deleteIngrediente(id)
      }
    };

    return operations[this.segmentValue]?.[action]?.() ?? null;
  }

  getObservable() {
    return this.getItemObservable(
      this.modalMode === 'add' ? 'add' : 'update'
    );
  }

  saveItem() {
    ['prezzo', 'prezzo_extra', 'sovrapprezzo'].forEach(key => {
      if (this.currentItem[key] !== undefined &&
          this.currentItem[key] !== null &&
          this.currentItem[key] !== '') {
        this.currentItem[key] = Number(this.currentItem[key]);
      }
    });

    this.getObservable()?.subscribe({
      next: () => {
        const name = this.segmentValue;

        this.showToast(
          `${name.charAt(0).toUpperCase() + name.slice(1)} salvato con successo`
        );

        this.loadAllData();
        this.closeModal();
      },
      error: (err: any) => {
        this.showToast(
          `Errore durante il salvataggio: ${err.error?.message || 'Errore generico'}`,
          'danger'
        );
      }
    });
  }

  async confirmDeleteItem(item: any) {
    const alert = await this.alertController.create({
      header: 'Conferma eliminazione',
      message: `Sei sicuro di voler eliminare "${item.nome}"? L'azione è irreversibile.`,
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: () => this.deleteItem(item)
        }
      ]
    });

    await alert.present();
  }

  deleteItem(item: any) {
    this.getItemObservable('delete', item)?.subscribe({
      next: () => {
        this.showToast('Elemento eliminato');
        this.loadAllData();
      },
      error: () => this.showToast('Errore durante l\'eliminazione', 'danger')
    });
  }

  toggleAvailability(item: any, event: any) {
    const newValue = event.detail.checked ? 1 : 0;

    if (item.disponibile === newValue) return;

    const oldValue = item.disponibile;
    item.disponibile = newValue;

    this.getItemObservable('update', item)?.subscribe({
      next: () => this.showToast('Disponibilità aggiornata'),
      error: (err: any) => {
        console.error('Errore aggiornamento disponibilità', err);

        this.showToast('Errore aggiornamento disponibilità', 'danger');
        item.disponibile = oldValue;
      }
    });
  }

  // NOTIFICHE

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });

    await toast.present();
  }

  // FORMATTAZIONE MODIFICHE ORDINE

  formatModifiche(modifiche: string): string[] {
    if (!modifiche) return [];

    const parts = modifiche.includes('Starter:') || modifiche.includes('Bibita:')
      ? modifiche.split(/(?:,\s*|\n+)(?=[A-Z][a-zA-ZÀ-ÿ\s]*:)/)
      : modifiche.includes('\n')
        ? modifiche.split('\n')
        : [modifiche];

    return parts.map(part => part.trim()).filter(Boolean);
  }
}