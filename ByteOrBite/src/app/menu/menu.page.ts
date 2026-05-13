import { Component } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle,IonCardSubtitle, IonCardContent, IonButton, IonIcon, 
  IonText, IonList, IonItem, IonLabel, IonThumbnail, 
  IonBadge, IonListHeader, IonImg 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-menu',
  templateUrl: 'menu.page.html',
  styleUrls: ['menu.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle,IonCardSubtitle, IonCardContent, IonButton, IonIcon, 
    IonText, IonList, IonItem, IonLabel, IonThumbnail, 
    IonBadge, IonListHeader, IonImg 
  ]
})
export class MenuPage {
  constructor() {}
}
