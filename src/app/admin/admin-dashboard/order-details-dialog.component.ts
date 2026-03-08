import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <h2 mat-dialog-title>Order Details #{{ data.id }}</h2>
    <mat-dialog-content>
      <div class="order-info">
        <p><strong>Customer ID:</strong> {{ data.userId }}</p>
        <p><strong>Date:</strong> {{ data.date | date:'medium' }}</p>
        <p><strong>Status:</strong> <span class="status-badge" [ngClass]="data.status">{{ data.status }}</span></p>
        <p><strong>Address:</strong> {{ data.address }}</p>
        <p><strong>Phone:</strong> {{ data.phone }}</p>
        <p><strong>Payment Method:</strong> {{ data.paymentMethod }}</p>
      </div>

      <h3>Items</h3>
      <table mat-table [dataSource]="data.items" class="items-table">
        <ng-container matColumnDef="image">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let item">
            <img [src]="item.image" class="item-thumb">
          </td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Product</th>
          <td mat-cell *matCellDef="let item">{{ item.productName }}</td>
        </ng-container>

        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Price</th>
          <td mat-cell *matCellDef="let item">{{ item.price | currency }}</td>
        </ng-container>

        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef>Qty</th>
          <td mat-cell *matCellDef="let item">x{{ item.quantity }}</td>
        </ng-container>

        <ng-container matColumnDef="total">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let item"><strong>{{ (item.price * item.quantity) | currency }}</strong></td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <div class="order-summary">
        <div class="summary-line grand-total">
          <span>Grand Total:</span>
          <span>{{ data.total | currency }}</span>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .order-info { margin-bottom: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px; columns: 2; gap: 24px; }
    .order-info p { margin: 8px 0; }
    .status-badge { padding: 4px 8px; border-radius: 12px; text-transform: capitalize; font-size: 0.85em; font-weight: 600; }
    .status-badge.pending { background: #fff3e0; color: #f57c00; }
    .status-badge.confirmed { background: #e8f5e9; color: #2e7d32; }
    .status-badge.cancelled { background: #ffebee; color: #c62828; }
    .item-thumb { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; }
    .items-table { width: 100%; }
    .order-summary { margin-top: 24px; border-top: 2px solid #eee; padding-top: 16px; }
    .grand-total { display: flex; justify-content: flex-end; gap: 16px; font-size: 1.25em; font-weight: 800; color: #2e7d32; }
  `]
})
export class OrderDetailsDialogComponent {
  displayedColumns = ['image', 'name', 'price', 'quantity', 'total'];
  constructor(@Inject(MAT_DIALOG_DATA) public data: Order) {}
}
