import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../../models/product.model';

@Pipe({
  name: 'priceRange',
  standalone: true
})
export class PriceRangePipe implements PipeTransform {
  transform(products: Product[], minPrice: number, maxPrice: number): Product[] {
    if (!products) return [];
    if (!minPrice && !maxPrice) return products;

    return products.filter(product => {
      const effectivePrice = product.price * (1 - product.discount / 100);
      const matchMin = minPrice ? effectivePrice >= minPrice : true;
      const matchMax = maxPrice ? effectivePrice <= maxPrice : true;
      return matchMin && matchMax;
    });
  }
}
