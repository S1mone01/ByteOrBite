import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { addIcons } from 'ionicons';
import { cartOutline } from 'ionicons/icons';

import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonButton, IonIcon, 
  IonText, 
  IonBadge, IonImg
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-menu',
  templateUrl: 'menu.page.html',
  styleUrls: ['menu.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonButton, IonIcon, 
    IonText, 
    IonBadge, IonImg, CommonModule
  ]
})
export class MenuPage implements OnInit {
  // Array che conterrà i menu combo dal DB
  listaMenu: any[] = [];

  constructor(private dataService: DataService) { addIcons({ cartOutline });}

  ngOnInit() {
    this.caricaMenuCombo();
  }

  caricaMenuCombo() {
    this.dataService.getMenu().subscribe({
      next: (dati) => {
        this.listaMenu = dati;
        console.log('Menu caricati con successo:', dati);
      },
      error: (err) => {
        console.error('Errore nel caricamento dei menu:', err);
      }
    });
  }
}