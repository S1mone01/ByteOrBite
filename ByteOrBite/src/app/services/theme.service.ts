import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme) {
      this.setDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.setDarkMode(prefersDark.matches);
    }
  }

  setDarkMode(isDark: boolean) {
    this.isDarkMode.next(isDark);
    localStorage.setItem('theme-preference', isDark ? 'dark' : 'light');
    document.body.classList.toggle('ion-palette-dark', isDark);
  }

  toggleTheme() {
    this.setDarkMode(!this.isDarkMode.value);
  }

  get currentThemeValue(): boolean {
    return this.isDarkMode.value;
  }
}
