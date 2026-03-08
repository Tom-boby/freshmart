import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/cart.model';
import { Order } from '../../models/order.model';
import { OrderConfirmDialogComponent } from './order-confirm-dialog.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatRadioModule, MatDialogModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  cartTotal = 0;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getCartItems();
    this.cartTotal = this.cartService.getCartTotal();

    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    const user = this.authService.getCurrentUser();
    this.checkoutForm = this.fb.group({
      fullName: [user?.name || '', [Validators.required, Validators.minLength(3)]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: [user?.phone || '', [Validators.required, Validators.minLength(5)]],
      address: [user?.address || '', Validators.required],
      city: ['', Validators.required],
      zipCode: ['', Validators.required],
      paymentMethod: ['Credit Card', Validators.required]
    });
  }

  getFieldError(field: string): string {
    const control = this.checkoutForm.get(field);
    if (control?.hasError('required')) return `${field} is required`;
    if (control?.hasError('email')) return 'Please enter a valid email';
    if (control?.hasError('minlength')) return `Minimum ${control.errors?.['minlength'].requiredLength} characters`;
    if (control?.hasError('pattern')) return 'Invalid format';
    return '';
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const dialogRef = this.dialog.open(OrderConfirmDialogComponent, {
      width: '400px',
      data: { total: this.getGrandTotal(), itemCount: this.cartItems.length }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.submitOrder();
      }
    });
  }

  private submitOrder(): void {
    const user = this.authService.getCurrentUser();
    const formValue = this.checkoutForm.value;

    const order: Order = {
      userId: user?.id || 0,
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price * (1 - item.product.discount / 100),
        quantity: item.quantity,
        image: item.product.image
      })),
      total: this.getGrandTotal(),
      address: `${formValue.address}, ${formValue.city} ${formValue.zipCode}`,
      phone: formValue.phone,
      status: 'pending',
      date: new Date().toISOString(),
      paymentMethod: formValue.paymentMethod
    };

    this.orderService.placeOrder(order).subscribe({
      next: () => {
        // Reduct Stock for each item
        this.cartItems.forEach(item => {
          const newStock = Math.max(0, item.product.stock - item.quantity);
          this.productService.updateStock(item.product.id, newStock).subscribe();
        });

        this.cartService.clearCart();
        this.snackBar.open('Order placed successfully! 🎉', 'OK', { duration: 5000 });
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.snackBar.open('Failed to place order. Please try again.', 'OK', { duration: 3000 });
      }
    });
  }

  getDeliveryFee(): number {
    return this.cartTotal >= 4150 ? 0 : 100;
  }

  getGrandTotal(): number {
    return this.cartTotal + this.getDeliveryFee();
  }
}
