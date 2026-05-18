import { Component } from '@angular/core';
import { 
  IonContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline, arrowForwardOutline, fastFoodOutline, restaurantOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonContent
  ],
})
export class HomePage {
  constructor() {
    addIcons({ starOutline, arrowForwardOutline, fastFoodOutline, restaurantOutline, personOutline });
  }
}
