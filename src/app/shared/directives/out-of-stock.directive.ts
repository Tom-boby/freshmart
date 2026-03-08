import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appOutOfStock]',
  standalone: true
})
export class OutOfStockDirective implements OnInit {
  @Input('appOutOfStock') stock: number = 0;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if (this.stock <= 0) {
      this.el.nativeElement.style.opacity = '0.6';
      this.el.nativeElement.style.position = 'relative';
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.3);
        z-index: 5;
        pointer-events: none;
        border-radius: inherit;
      `;
      const label = document.createElement('span');
      label.textContent = 'OUT OF STOCK';
      label.style.cssText = `
        background: rgba(244, 67, 54, 0.9);
        color: white;
        padding: 8px 20px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 14px;
        letter-spacing: 1px;
      `;
      overlay.appendChild(label);
      this.el.nativeElement.appendChild(overlay);
    }
  }
}
