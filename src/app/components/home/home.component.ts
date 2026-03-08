import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { HighlightDiscountDirective } from '../../shared/directives/highlight-discount.directive';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { FeedbackService } from '../../services/feedback.service';
import { AuthService } from '../../services/auth.service';
import { Feedback } from '../../models/feedback.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatInputModule, MatFormFieldModule, MatSnackBarModule,
    MatDialogModule, HighlightDiscountDirective
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  
  // Feedback Form State
  suggestion: string = '';
  feedback: string = '';
  rating: number = 0;
  hoverRating: number = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private feedbackService: FeedbackService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.productService.getFeaturedProducts().subscribe((products: Product[]) => {
      this.featuredProducts = products;
    });
    this.productService.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories;
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  getDiscountedPrice(product: Product): number {
    return product.price * (1 - product.discount / 100);
  }

  setRating(star: number): void {
    this.rating = star;
  }

  setHover(star: number): void {
    this.hoverRating = star;
  }

  submitFeedback(): void {
    const user = this.authService.getCurrentUser();
    const feedbackData: Feedback = {
      userId: user?.id,
      userName: user ? user.name : 'Random',
      rating: this.rating,
      suggestion: this.suggestion,
      message: this.feedback,
      date: new Date().toISOString()
    };

    this.feedbackService.submitFeedback(feedbackData).subscribe({
      next: () => {
        this.snackBar.open('Thank you for your feedback! We appreciate your suggestions.', 'Close', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
        
        // Reset form
        this.suggestion = '';
        this.feedback = '';
        this.rating = 0;
        this.hoverRating = 0;
      },
      error: () => {
        this.snackBar.open('Failed to submit feedback. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  openContactDialog(type: 'email' | 'phone', value: string): void {
    const dialogData: ConfirmDialogData = {
      title: 'External Link',
      message: `You are about to open your ${type} client. Do you wish to proceed?`,
      confirmText: 'Yes, Proceed',
      cancelText: 'Cancel',
      color: 'primary',
      icon: type === 'email' ? 'email' : 'phone_forwarded'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        if (type === 'email') {
          window.location.href = `mailto:${value}`;
        } else if (type === 'phone') {
          window.location.href = `tel:${value}`;
        }
      }
    });
  }
}
