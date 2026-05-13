import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, 
  IonHeader, IonToolbar, IonButtons, IonButton, IonTitle,
  IonMenuButton, IonAvatar, IonText, IonPopover, IonList, IonItem,
  IonContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, fastFoodOutline, personOutline, 
  sunnyOutline, moonOutline, logOutOutline, personCircleOutline,
  starOutline
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
    IonHeader, IonToolbar, IonButtons, IonButton, IonTitle,
    IonAvatar, IonText, IonPopover, IonList, IonItem, IonContent
  ],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);
  isDarkMode = false;
  currentUser$: Observable<any>;

  constructor(private authService: AuthService) {
    addIcons({ 
      homeOutline, fastFoodOutline, personOutline, 
      sunnyOutline, moonOutline, logOutOutline, personCircleOutline,
      starOutline
    });
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Verifica preferenza tema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isDarkMode = prefersDark.matches;
    this.updateTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.updateTheme();
  }

  updateTheme() {
    document.body.classList.toggle('ion-palette-dark', this.isDarkMode);
  }

  logout() {
    this.authService.logout();
  }
}
