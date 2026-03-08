import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  color?: 'primary' | 'accent' | 'warn';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title style="display: flex; align-items: center; gap: 8px;" [style.color]="data.color === 'warn' ? '#f44336' : (data.color === 'primary' ? '#2e7d32' : '#333')">
      <mat-icon fill>{{ data.icon || 'warning' }}</mat-icon> {{ data.title || 'Confirmation' }}
    </h2>
    <mat-dialog-content>
      <p style="font-size: 16px; margin: 16px 0;">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">{{ data.cancelText || 'Cancel' }}</button>
      <button mat-flat-button [color]="data.color || 'primary'" (click)="dialogRef.close(true)">{{ data.confirmText || 'Confirm' }}</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
