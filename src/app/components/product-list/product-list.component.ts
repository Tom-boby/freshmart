import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { HighlightDiscountDirective } from '../../shared/directives/highlight-discount.directive';
import { OutOfStockDirective } from '../../shared/directives/out-of-stock.directive';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatSliderModule, MatCheckboxModule, MatChipsModule,
    HighlightDiscountDirective, OutOfStockDirective
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategory = 'All';
  minPrice = 0;
  maxPrice = 50;
  showInStockOnly = false;
  searchTerm = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((products: Product[]) => {
      this.products = products;
    });
    this.productService.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories;
    });
    this.route.queryParams.subscribe((params: any) => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  getDiscountedPrice(product: Product): number {
    return product.price * (1 - product.discount / 100);
  }

  get filteredProducts(): Product[] {
    let filtered = this.products;

    if (this.selectedCategory && this.selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    if (this.minPrice > 0 || this.maxPrice < 50) {
      filtered = filtered.filter(p => {
        const price = p.price * (1 - p.discount / 100);
        return price >= this.minPrice && price <= this.maxPrice;
      });
    }

    if (this.showInStockOnly) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  clearFilters(): void {
    this.selectedCategory = 'All';
    this.minPrice = 0;
    this.maxPrice = 50;
    this.showInStockOnly = false;
    this.searchTerm = '';
  }
}
