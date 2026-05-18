import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DataService } from '../services/data.service';
import { 
  IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-panini',
  templateUrl: 'panini.page.html',
  styleUrls: ['panini.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardSubtitle
  ],
})
export class PaniniPage implements OnInit {

  panini: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.caricaPanini();
  }

  caricaPanini() {
    this.dataService.getPanini().subscribe({
      next: (data) => {
        this.panini = data;
      },
      error: (err) => {
        console.error('Errore nel recupero dei panini dal DB:', err);
      }
    });
  }

  getImageUrl(path: string) {
    if (!path) return 'assets/1024v5.png';
    if (path.startsWith('http') || path.startsWith('assets/')) {
      return path;
    }
    return `${this.dataService.getApiUrl()}/${path}`;
  }
}
