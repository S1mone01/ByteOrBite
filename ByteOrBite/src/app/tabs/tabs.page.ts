import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, 
  IonHeader, IonToolbar, IonButtons, IonButton,
  IonMenuButton, IonPopover, IonList, IonItem,
  IonContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, fastFoodOutline, personOutline, 
  sunnyOutline, moonOutline, logOutOutline, personCircleOutline,
  starOutline, settingsOutline
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
    IonHeader, IonToolbar, IonButtons, IonButton,
    IonPopover, IonList, IonItem, IonContent
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
      starOutline, settingsOutline
    });
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Carica preferenza tema salvata o usa quella di sistema
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.isDarkMode = prefersDark.matches;
    }
    this.updateTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme-preference', this.isDarkMode ? 'dark' : 'light');
    this.updateTheme();
  }

  updateTheme() {
    document.body.classList.toggle('ion-palette-dark', this.isDarkMode);
  }

  logout() {
    this.authService.logout();
  }
}
