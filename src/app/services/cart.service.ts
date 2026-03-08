import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();
  public cartCount$ = this.cart$.pipe(
    map((items: CartItem[]) => items.reduce((count: number, item: CartItem) => count + item.quantity, 0))
  );

  constructor(private snackBar: MatSnackBar) {
    this.loadCart();
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem('grocery_cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  private saveCart(): void {
    localStorage.setItem('grocery_cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }

  addToCart(product: Product, quantity: number = 1): void {
    const existingItem = this.cartItems.find((item: CartItem) => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        this.snackBar.open(`Sorry, only ${product.stock} items in stock.`, 'OK', { duration: 3000 });
        return;
      }
      existingItem.quantity += quantity;
    } else {
      if (quantity > product.stock) {
        this.snackBar.open(`Sorry, only ${product.stock} items in stock.`, 'OK', { duration: 3000 });
        return;
      }
      this.cartItems.push({ product, quantity });
    }

    this.saveCart();
    this.snackBar.open(`${product.name} added to cart!`, 'OK', { duration: 2000 });
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.cartItems.find((ci: CartItem) => ci.product.id === productId);
    if (item) {
      if (quantity > item.product.stock) {
        this.snackBar.open(`Only ${item.product.stock} items in stock.`, 'OK', { duration: 3000 });
        return;
      }
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
      }
    }
  }

  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter((item: CartItem) => item.product.id !== productId);
    this.saveCart();
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total: number, item: CartItem) => {
      const price = item.product.price * (1 - item.product.discount / 100);
      return total + (price * item.quantity);
    }, 0);
  }
}
