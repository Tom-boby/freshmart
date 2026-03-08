import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, MatProgressBarModule],
  template: `
    <app-navbar></app-navbar>
    <mat-progress-bar *ngIf="loadingService.loading$ | async" mode="indeterminate" class="loading-bar"></mat-progress-bar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2026 FreshMart Grocery. All rights reserved.</p>
        <p>Built with Angular & Angular Material</p>
      </div>
    </footer>
  `,
  styles: [`
    .loading-bar {
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      z-index: 999;
    }

    .main-content {
      min-height: calc(100vh - 180px);
      background: #fafafa;
    }

    .app-footer {
      background: #263238;
      color: rgba(255, 255, 255, 0.7);
      padding: 24px 16px;
      text-align: center;

      .footer-content {
        max-width: 1400px;
        margin: 0 auto;

        p {
          margin: 4px 0;
          font-size: 13px;
        }
      }
    }
  `]
})
export class AppComponent {
  title = 'FreshMart Grocery';

  constructor(public loadingService: LoadingService) {}
}
