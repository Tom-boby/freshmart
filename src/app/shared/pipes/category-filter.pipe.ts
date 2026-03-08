import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../../models/product.model';

@Pipe({
  name: 'categoryFilter',
  standalone: true
})
export class CategoryFilterPipe implements PipeTransform {
  transform(products: Product[], category: string): Product[] {
    if (!products || !category || category === 'All') {
      return products;
    }
    return products.filter(product => product.category === category);
  }
}
