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
import { ThemeService } from '../services/theme.service';
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
  currentUser$: Observable<any>;
  isDarkMode$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    addIcons({ 
      homeOutline, fastFoodOutline, personOutline, 
      sunnyOutline, moonOutline, logOutOutline, personCircleOutline,
      starOutline, settingsOutline
    });
    this.currentUser$ = this.authService.currentUser$;
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  ngOnInit() {
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
  }
}
