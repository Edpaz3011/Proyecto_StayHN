import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './page-placeholder.component.html',
  styleUrls: ['./page-placeholder.component.css']
})
export class PagePlaceholderComponent {
  title = 'Página';
  returnLink = '/';

  constructor(private route: ActivatedRoute) {
    const dataTitle = this.route.snapshot.data['title'];
    const path = this.route.snapshot.routeConfig?.path || '';
    this.title = dataTitle || this.formatPathName(path);
    this.returnLink = path?.startsWith('admin') ? '/admin' : '/guest';
  }

  private formatPathName(path: string): string {
    if (!path) {
      return 'Página';
    }

    return path
      .split('/')
      .map(segment => segment.replace(/-/g, ' '))
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' - ');
  }
}
