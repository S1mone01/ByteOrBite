import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonContent, IonIcon, IonSearchbar,
  IonList, IonItem, IonLabel, IonSpinner,
  ModalController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline, locateOutline, locationOutline, searchOutline } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';

import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonContent, IonIcon, IonSearchbar,
    IonList, IonItem, IonLabel, IonSpinner
  ]
})
export class MapModalComponent implements OnInit {
  @Input() initialLat?: number;
  @Input() initialLon?: number;

  selectedAddress: string = '';
  selectedCoords: { lat: number, lon: number } | null = null;
  mapUrl: SafeResourceUrl | null = null;
  isDarkMode$: Observable<boolean>;
  
  searchQuery: string = '';
  searchResults: any[] = [];
  isSearching: boolean = false;
  isGeocoding: boolean = false;
  isLocating: boolean = false;

  private currentRawUrl: string = '';

  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private toastController: ToastController,
    private sanitizer: DomSanitizer,
    private themeService: ThemeService
  ) {
    addIcons({ closeOutline, checkmarkOutline, locateOutline, locationOutline, searchOutline });
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  ngOnInit() {
    if (this.initialLat && this.initialLon) {
      this.selectedCoords = { lat: this.initialLat, lon: this.initialLon };
      this.updateMapUrl(this.initialLat, this.initialLon);
      this.reverseGeocode(this.initialLat, this.initialLon);
    } else {
      this.getCurrentLocation();
    }
  }

  updateMapUrl(lat: number, lon: number) {
    const rawUrl = `https://maps.google.com/maps?q=${lat},${lon}&hl=it&z=16&output=embed`;
    if (this.currentRawUrl !== rawUrl) {
      this.currentRawUrl = rawUrl;
      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
    }
  }

  async getCurrentLocation() {
    if ('geolocation' in navigator) {
      this.isLocating = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.isLocating = false;
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.selectedCoords = { lat, lon };
          this.updateMapUrl(lat, lon);
          this.reverseGeocode(lat, lon);
          this.showToast('Posizione GPS rilevata!', 'success');
        },
        (error) => {
          this.isLocating = false;
          console.error('Error getting location', error);
          if (!this.selectedCoords) {
            const defaultLat = 45.4642; // Milano
            const defaultLon = 9.1900;
            this.selectedCoords = { lat: defaultLat, lon: defaultLon };
            this.updateMapUrl(defaultLat, defaultLon);
            this.reverseGeocode(defaultLat, defaultLon);
          }
          this.showToast('Impossibile recuperare la posizione GPS', 'warning');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      if (!this.selectedCoords) {
        const defaultLat = 45.4642;
        const defaultLon = 9.1900;
        this.selectedCoords = { lat: defaultLat, lon: defaultLon };
        this.updateMapUrl(defaultLat, defaultLon);
        this.reverseGeocode(defaultLat, defaultLon);
      }
    }
  }

  onSearchInput(event: any) {
    const query = event.detail?.value !== undefined ? event.detail.value : this.searchQuery;
    if (!query || query.trim().length < 3) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=5&addressdetails=1`;
    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        this.isSearching = false;
        this.searchResults = results || [];
      },
      error: (err) => {
        this.isSearching = false;
        console.error('Search geocoding error', err);
        this.searchResults = [];
      }
    });
  }

  searchAddress() {
    if (!this.searchQuery || this.searchQuery.trim().length < 3) return;
    this.isSearching = true;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery.trim())}&limit=5&addressdetails=1`;
    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        this.isSearching = false;
        if (results && results.length > 0) {
          this.selectSearchResult(results[0]);
        } else {
          this.showToast('Nessun indirizzo trovato', 'warning');
        }
      },
      error: (err) => {
        this.isSearching = false;
        console.error('Search error', err);
        this.showToast('Errore durante la ricerca', 'danger');
      }
    });
  }

  selectSearchResult(result: any) {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    this.selectedCoords = { lat, lon };
    this.selectedAddress = result.display_name;
    this.searchQuery = result.display_name;
    this.searchResults = [];
    this.updateMapUrl(lat, lon);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
  }

  reverseGeocode(lat: number, lon: number) {
    this.isGeocoding = true;
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.isGeocoding = false;
        if (data && data.display_name) {
          this.selectedAddress = data.display_name;
          this.searchQuery = data.display_name;
        } else {
          this.selectedAddress = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
        }
      },
      error: (err) => {
        this.isGeocoding = false;
        console.error('Reverse geocoding error', err);
        this.selectedAddress = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
      }
    });
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  cancel() {
    this.modalController.dismiss();
  }

  confirm() {
    this.modalController.dismiss({
      address: this.selectedAddress,
      coords: this.selectedCoords
    });
  }
}
