import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name?: string;
  points?: number;
}

interface AuthResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Carica l'utente dal localStorage all'avvio
    const savedUser = localStorage.getItem('byte_or_bite_user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(response => response.user),
      tap(user => {
        console.log('User logged in:', user);
        this.currentUserSubject.next(user);
        localStorage.setItem('byte_or_bite_user', JSON.stringify(user));
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  register(email: string, password: string, name: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password }).pipe(
      map(response => response.user),
      tap(user => {
        console.log('User registered:', user);
        this.currentUserSubject.next(user);
        localStorage.setItem('byte_or_bite_user', JSON.stringify(user));
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('byte_or_bite_user');
  }

  resetPassword(email: string): Observable<any> {
    // Placeholder per il reset password (ancora mock o da implementare nel backend)
    console.log(`Reset password request for: ${email}`);
    return this.http.post(`${this.apiUrl}/reset-password`, { email }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
}
