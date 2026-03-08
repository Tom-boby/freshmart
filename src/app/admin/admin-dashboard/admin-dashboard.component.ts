import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Order } from '../../models/order.model';
import { Feedback } from '../../models/feedback.model';
import { FeedbackService } from '../../services/feedback.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { OrderDetailsDialogComponent } from './order-details-dialog.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatTabsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogModule, ConfirmDialogComponent, OrderDetailsDialogComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  orders: Order[] = [];
  feedbacks: Feedback[] = [];
  productForm!: FormGroup;
  editingProduct: Product | null = null;
  showProductForm = false;
  searchTerm = '';

  productColumns = ['id', 'image', 'name', 'category', 'price', 'stock', 'discount', 'actions'];
  orderColumns = ['id', 'date', 'items', 'total', 'status', 'actions'];
  feedbackColumns = ['date', 'userName', 'rating', 'message', 'actions'];

  // Stats
  totalProducts = 0;
  lowStockCount = 0;
  outOfStockCount = 0;
  totalOrders = 0;
  totalRevenue = 0;

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private feedbackService: FeedbackService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      image: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      unit: ['', Validators.required],
      featured: [false]
    });
  }

  private loadData(): void {
    this.productService.getProducts().subscribe((products: Product[]) => {
      this.products = products;
      this.totalProducts = products.length;
      this.lowStockCount = products.filter((p: Product) => p.stock > 0 && p.stock < 20).length;
      this.outOfStockCount = products.filter((p: Product) => p.stock === 0).length;
    });

    this.productService.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories;
    });

    this.orderService.getOrders().subscribe((orders: Order[]) => {
      this.orders = orders;
      this.totalOrders = orders.length;
      this.totalRevenue = orders.reduce((sum: number, o: Order) => sum + o.total, 0);
    });

    this.feedbackService.getFeedbacks().subscribe((feedbacks: Feedback[]) => {
      this.feedbacks = feedbacks.reverse(); // Newest first
    });
  }

  get filteredProducts(): Product[] {
    if (!this.searchTerm) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter((p: Product) =>
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }

  openAddForm(): void {
    this.editingProduct = null;
    this.productForm.reset({ price: 0, stock: 0, discount: 0, featured: false });
    this.showProductForm = true;
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.productForm.patchValue(product);
    this.showProductForm = true;
  }

  cancelForm(): void {
    this.showProductForm = false;
    this.editingProduct = null;
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const productData = this.productForm.value;

    if (this.editingProduct) {
      const updated = { ...this.editingProduct, ...productData };
      this.productService.updateProduct(updated).subscribe(() => {
        this.snackBar.open('Product updated successfully!', 'OK', { duration: 3000 });
        this.loadData();
        this.cancelForm();
      });
    } else {
      this.productService.addProduct(productData).subscribe(() => {
        this.snackBar.open('Product added successfully!', 'OK', { duration: 3000 });
        this.loadData();
        this.cancelForm();
      });
    }
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe(() => {
        this.snackBar.open('Product deleted!', 'OK', { duration: 3000 });
        this.loadData();
      });
    }
  }

  updateOrderStatus(order: Order, status: string): void {
    this.orderService.updateOrderStatus(order.id!, status).subscribe(() => {
      this.snackBar.open(`Order #${order.id} updated to ${status}`, 'OK', { duration: 3000 });
      this.loadData();
    });
  }

  viewOrderDetails(order: Order): void {
    this.dialog.open(OrderDetailsDialogComponent, {
      width: '800px',
      data: order
    });
  }

  deleteOrder(order: Order): void {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Order',
      message: `Are you sure you want to delete Order #${order.id}? This action cannot be undone.`,
      confirmText: 'Delete',
      color: 'warn',
      icon: 'delete_forever'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.orderService.deleteOrder(order.id!).subscribe(() => {
          this.snackBar.open('Order deleted!', 'OK', { duration: 3000 });
          this.loadData();
        });
      }
    });
  }

  deleteFeedback(feedback: Feedback): void {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Feedback',
      message: `Are you sure you want to delete feedback from "${feedback.userName}"?`,
      confirmText: 'Delete',
      color: 'warn',
      icon: 'delete'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.feedbackService.deleteFeedback(feedback.id!).subscribe(() => {
          this.snackBar.open('Feedback deleted!', 'OK', { duration: 3000 });
          this.loadData();
        });
      }
    });
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock < 20) return 'low-stock';
    return 'in-stock';
  }
}
