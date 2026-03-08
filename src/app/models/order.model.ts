export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id?: number;
  userId: number;
  items: OrderItem[];
  total: number;
  address: string;
  phone: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  paymentMethod: string;
}
