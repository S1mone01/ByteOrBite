import { Component } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonButton, IonIcon, 
  IonText, IonList, IonItem, IonLabel, IonThumbnail, 
  IonBadge, IonListHeader, IonImg 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-panini',
  templateUrl: 'panini.page.html',
  styleUrls: ['panini.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonButton, IonIcon, 
    IonText, IonList, IonItem, IonLabel, IonThumbnail, 
    IonBadge, IonListHeader, IonImg 
  ],
})
export class PaniniPage {
  constructor() {}
}
