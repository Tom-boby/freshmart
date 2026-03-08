import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../../models/product.model';

@Pipe({
  name: 'stockFilter',
  standalone: true
})
export class StockFilterPipe implements PipeTransform {
  transform(products: Product[], showInStockOnly: boolean): Product[] {
    if (!products || !showInStockOnly) {
      return products;
    }
    return products.filter(product => product.stock > 0);
  }
}
