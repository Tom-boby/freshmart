import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTableModule, MatDialogModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  displayedColumns: string[] = ['image', 'name', 'price', 'quantity', 'total', 'actions'];

  constructor(public cartService: CartService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe((items: CartItem[]) => {
      this.cartItems = items;
    });
  }

  getItemPrice(item: CartItem): number {
    return item.product.price * (1 - item.product.discount / 100);
  }

  getItemTotal(item: CartItem): number {
    return this.getItemPrice(item) * item.quantity;
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number): void {
    const dialogRef = this.dialog.open(CartDeleteDialogComponent, {
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cartService.removeFromCart(productId);
      }
    });
  }

  clearCart(): void {
    const dialogRef = this.dialog.open(CartClearDialogComponent, {
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cartService.clearCart();
      }
    });
  }

  getCartTotal(): number {
    return this.cartService.getCartTotal();
  }
}

@Component({
  selector: 'app-cart-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="color: #d32f2f; vertical-align: middle;">warning</mat-icon>
      Delete Item
    </h2>
    <mat-dialog-content>
      <p>Do you want to delete this item from your cart?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">No</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">
        <mat-icon>delete</mat-icon> Yes, Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { padding: 16px 24px; min-width: 300px; }
  `]
})
export class CartDeleteDialogComponent {
  constructor(public dialogRef: MatDialogRef<CartDeleteDialogComponent>) {}
}

@Component({
  selector: 'app-cart-clear-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="color: #d32f2f; vertical-align: middle;">warning</mat-icon>
      Clear Cart
    </h2>
    <mat-dialog-content>
      <p>Are you sure you want to remove all items from your cart?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">
        <mat-icon>delete_sweep</mat-icon> Yes, Clear
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { padding: 16px 24px; min-width: 300px; }
  `]
})
export class CartClearDialogComponent {
  constructor(public dialogRef: MatDialogRef<CartClearDialogComponent>) {}
}
