import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatInputModule, MatFormFieldModule,
    MatTooltipModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity = 1;
  relatedProducts: Product[] = [];
  
  // Admin Editing
  isAdmin = false;
  isEditingStock = false;
  newStock = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      const id = +params['id'];
      this.productService.getProduct(id).subscribe((product: Product) => {
        this.product = product;
        this.newStock = product.stock;
        this.loadRelatedProducts(product.category);
      });
    });

    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
    });
  }

  private loadRelatedProducts(category: string): void {
    this.productService.getProductsByCategory(category).subscribe((products: Product[]) => {
      this.relatedProducts = products.filter(p => p.id !== this.product?.id).slice(0, 4);
    });
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
    }
  }

  getDiscountedPrice(): number {
    if (!this.product) return 0;
    return this.product.price * (1 - this.product.discount / 100);
  }

  increaseQty(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  toggleStockEdit(): void {
    this.isEditingStock = !this.isEditingStock;
    if (this.isEditingStock && this.product) {
      this.newStock = this.product.stock;
    }
  }

  saveStock(): void {
    if (this.product && this.newStock >= 0) {
      this.productService.updateStock(this.product.id, this.newStock).subscribe(() => {
        if (this.product) {
          this.product.stock = this.newStock;
          this.snackBar.open('Stock updated successfully!', 'OK', { duration: 3000 });
        }
        this.isEditingStock = false;
      });
    }
  }
}
