import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { User } from '../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.currentUser$.pipe(map((user: User | null) => !!user));
  public isAdmin$ = this.currentUser$.pipe(map((user: User | null) => user?.role === 'admin'));

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
    this.loadUser();
  }

  private loadUser(): void {
    const savedUser = localStorage.getItem('grocery_user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<User | null> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}&password=${password}`).pipe(
      map(users => {
        if (users.length > 0) {
          const user = users[0];
          localStorage.setItem('grocery_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.snackBar.open(`Welcome back, ${user.name}!`, 'OK', { duration: 3000 });
          return user;
        }
        this.snackBar.open('Invalid email or password', 'OK', { duration: 3000 });
        return null;
      })
    );
  }

  signup(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(newUser => {
        localStorage.setItem('grocery_user', JSON.stringify(newUser));
        this.currentUserSubject.next(newUser);
        this.snackBar.open(`Welcome, ${newUser.name}!`, 'OK', { duration: 3000 });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('grocery_user');
    this.currentUserSubject.next(null);
    this.snackBar.open('Logged out successfully', 'OK', { duration: 2000 });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }
}
