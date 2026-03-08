import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/order.model';

import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatDialogModule
  ],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.orderService.getOrdersByUser(user.id).subscribe((orders: Order[]) => {
        this.orders = orders.sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    }
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': '#ff9800',
      'confirmed': '#2196f3',
      'shipped': '#9c27b0',
      'delivered': '#4caf50',
      'cancelled': '#f44336'
    };
    return colors[status] || '#999';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pending': 'schedule',
      'confirmed': 'check_circle',
      'shipped': 'local_shipping',
      'delivered': 'done_all',
      'cancelled': 'cancel'
    };
    return icons[status] || 'info';
  }

  cancelOrder(orderId: number): void {
    const dialogRef = this.dialog.open(OrderCancelDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderService.updateOrderStatus(orderId, 'cancelled').subscribe({
          next: () => {
            const order = this.orders.find(o => o.id === orderId);
            if (order) {
              order.status = 'cancelled';
            }
            this.snackBar.open('Order cancelled successfully', 'OK', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to cancel order', 'OK', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteOrder(orderId: number): void {
    const dialogRef = this.dialog.open(OrderDeleteDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderService.deleteOrder(orderId).subscribe({
          next: () => {
            this.orders = this.orders.filter(o => o.id !== orderId);
            this.snackBar.open('Order deleted successfully', 'OK', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to delete order', 'OK', { duration: 3000 });
          }
        });
      }
    });
  }
}

@Component({
  selector: 'app-order-cancel-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="color: #d32f2f; vertical-align: middle;">warning</mat-icon>
      Cancel Order
    </h2>
    <mat-dialog-content>
      <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">No, Keep Order</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">
        <mat-icon>cancel</mat-icon> Yes, Cancel Order
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { padding: 16px 24px; min-width: 350px; }
  `]
})
export class OrderCancelDialogComponent {
  constructor(public dialogRef: MatDialogRef<OrderCancelDialogComponent>) {}
}

@Component({
  selector: 'app-order-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="color: #d32f2f; vertical-align: middle;">delete_forever</mat-icon>
      Delete Order
    </h2>
    <mat-dialog-content>
      <p>Are you sure you want to permanently delete this order from your history?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">
        <mat-icon>delete</mat-icon> Yes, Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { padding: 16px 24px; min-width: 300px; }
  `]
})
export class OrderDeleteDialogComponent {
  constructor(public dialogRef: MatDialogRef<OrderDeleteDialogComponent>) {}
}
