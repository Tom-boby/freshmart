import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatToolbarModule, MatButtonModule,
    MatIconModule, MatBadgeModule, MatMenuModule, MatDialogModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  cartCount = 0;
  isLoggedIn = false;
  isAdmin = false;
  userName = '';

  constructor(
    private cartService: CartService,
    public authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cartService.cartCount$.subscribe((count: number) => this.cartCount = count);
    this.authService.currentUser$.subscribe((user: any) => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
      this.userName = user?.name || '';
    });
  }

  logout(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      color: 'warn',
      icon: 'logout'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.authService.logout();
        this.router.navigate(['/']);
      }
    });
  }

  openContactDialog(email: string): void {
    const dialogData: ConfirmDialogData = {
      title: 'External Link',
      message: 'You are about to open your email client to contact support. Do you wish to proceed?',
      confirmText: 'Yes, Proceed',
      cancelText: 'Cancel',
      color: 'primary',
      icon: 'contact_support'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        window.location.href = `mailto:${email}`;
      }
    });
  }
}
