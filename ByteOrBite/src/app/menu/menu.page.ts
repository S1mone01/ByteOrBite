import { Component } from '@angular/core';
import { 
  IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonTitle
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-menu',
  templateUrl: 'menu.page.html',
  styleUrls: ['menu.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardSubtitle, IonTitle
  ]
})
export class MenuPage {
  constructor() {}
}
