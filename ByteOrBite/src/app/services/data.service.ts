import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Panini
  getPanini(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/catalogo`);
  }
  addPanino(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/catalogo`, data);
  }
  updatePanino(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/catalogo/${id}`, data);
  }
  deletePanino(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/catalogo/${id}`);
  }

  // Bibite
  getBibite(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bibite`);
  }
  addBibita(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bibite`, data);
  }
  updateBibita(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/bibite/${id}`, data);
  }
  deleteBibita(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bibite/${id}`);
  }

  // Patatine
  getPatatine(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/patatine`);
  }
  addPatatine(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/patatine`, data);
  }
  updatePatatine(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/patatine/${id}`, data);
  }
  deletePatatine(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/patatine/${id}`);
  }

  // Menu
  getMenu(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/menu`);
  }
  addMenu(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/menu`, data);
  }
  updateMenu(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/menu/${id}`, data);
  }
  deleteMenu(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/menu/${id}`);
  }

  // Ingredienti
  getIngredienti(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ingredienti`);
  }
  addIngrediente(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ingredienti`, data);
  }
  updateIngrediente(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/ingredienti/${id}`, data);
  }
  deleteIngrediente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ingredienti/${id}`);
  }

  // Ordini
  getOrdini(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ordini`);
  }
  updateOrdine(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/ordini/${id}`, data);
  }
  deleteOrdine(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ordini/${id}`);
  }
}
