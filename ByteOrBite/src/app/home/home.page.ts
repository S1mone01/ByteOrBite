import { Component } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonButton, IonIcon, 
  IonText, IonList, IonItem, IonLabel, IonThumbnail, 
  IonBadge, IonListHeader, IonImg 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline, arrowForwardOutline, fastFoodOutline, restaurantOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonButton, IonIcon, 
    IonText, IonList, IonItem, IonLabel, IonThumbnail, 
    IonBadge, IonListHeader, IonImg 
  ],
})
export class HomePage {
  constructor() {
    addIcons({ starOutline, arrowForwardOutline, fastFoodOutline, restaurantOutline, personOutline });
  }
}
