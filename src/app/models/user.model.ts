export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'customer';
  address?: string;
  phone?: string;
}
