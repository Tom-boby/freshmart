import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-order-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="color: #2e7d32; vertical-align: middle;">check_circle</mat-icon>
      Confirm Order
    </h2>
    <mat-dialog-content>
      <p>You are about to place an order for <strong>{{ data.itemCount }} item(s)</strong>.</p>
      <p class="total-text">Total: <strong>{{ data.total | currency }}</strong></p>
      <p>Do you want to proceed?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="true">
        <mat-icon>shopping_bag</mat-icon> Place Order
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .total-text { font-size: 20px; color: #2e7d32; margin: 16px 0; }
    mat-dialog-content { padding: 16px 24px; }
  `]
})
export class OrderConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { total: number; itemCount: number }
  ) {}
}
