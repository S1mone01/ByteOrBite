import { Component, OnInit, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonContent, IonIcon, IonFooter,
  IonSearchbar, IonList, IonItem, IonLabel,
  ModalController, LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline, locateOutline } from 'ionicons/icons';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonContent, IonIcon, IonFooter,
    IonSearchbar, IonList, IonItem, IonLabel,
    CommonModule
  ]
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() initialLat?: number;
  @Input() initialLon?: number;

  map!: L.Map;
  marker!: L.Marker;
  tileLayer!: L.TileLayer;
  selectedAddress: string = '';
  selectedCoords: { lat: number, lon: number } | null = null;
  isGeocoding: boolean = false;
  private themeSub?: Subscription;

  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private themeService: ThemeService
  ) {
    addIcons({ closeOutline, checkmarkOutline, locateOutline });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    // Piccolo delay per assicurarsi che il container sia renderizzato correttamente nel modal
    setTimeout(() => {
      this.initMap();
    }, 300);
  }

  ngOnDestroy() {
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
  }

  initMap() {
    const defaultLat = this.initialLat || 45.4642; // Milano
    const defaultLon = this.initialLon || 9.1900;

    this.map = L.map('map', {
      zoomControl: false // Lo nascondiamo per un look più pulito su mobile
    }).setView([defaultLat, defaultLon], 13);

    // Gestione del tema
    this.themeSub = this.themeService.isDarkMode$.subscribe(isDark => {
      if (this.tileLayer) {
        this.map.removeLayer(this.tileLayer);
      }

      const tileUrl = isDark 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      
      const attribution = isDark
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      this.tileLayer = L.tileLayer(tileUrl, { attribution }).addTo(this.map);
    });

    // Fix for missing icons in Leaflet when used with build systems
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    this.marker = L.marker([defaultLat, defaultLon], {
      draggable: true,
      icon: defaultIcon
    }).addTo(this.map);

    this.marker.on('dragend', (event) => {
      const position = event.target.getLatLng();
      this.updatePosition(position.lat, position.lng);
    });

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const position = event.latlng;
      this.marker.setLatLng(position);
      this.updatePosition(position.lat, position.lng);
    });

    // Importante per ricalcolare le dimensioni del contenitore
    this.map.invalidateSize();

    if (this.initialLat && this.initialLon) {
      this.updatePosition(this.initialLat, this.initialLon);
    } else {
      this.getCurrentLocation();
    }
  }

  async getCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.map.setView([lat, lon], 16);
          this.marker.setLatLng([lat, lon]);
          this.updatePosition(lat, lon);
        },
        (error) => {
          console.error('Error getting location', error);
          this.showToast('Impossibile recuperare la posizione GPS', 'warning');
        }
      );
    }
  }

  updatePosition(lat: number, lon: number) {
    this.selectedCoords = { lat, lon };
    this.reverseGeocode(lat, lon);
  }

  reverseGeocode(lat: number, lon: number) {
    this.isGeocoding = true;
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.isGeocoding = false;
        if (data && data.display_name) {
          this.selectedAddress = data.display_name;
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
