import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appHighlightDiscount]',
  standalone: true
})
export class HighlightDiscountDirective implements OnInit {
  @Input('appHighlightDiscount') discount: number = 0;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if (this.discount > 0) {
      this.el.nativeElement.style.position = 'relative';
      const badge = document.createElement('span');
      badge.textContent = `-${this.discount}%`;
      badge.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(238, 90, 36, 0.4);
      `;
      this.el.nativeElement.appendChild(badge);
    }
  }
}
