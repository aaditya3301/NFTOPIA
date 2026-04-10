import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private push(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    const id = 'agentforge-notification-root';
    let root = document.getElementById(id);

    if (!root) {
      root = document.createElement('div');
      root.id = id;
      root.style.position = 'fixed';
      root.style.right = '16px';
      root.style.bottom = '16px';
      root.style.display = 'flex';
      root.style.flexDirection = 'column';
      root.style.gap = '8px';
      root.style.zIndex = '9999';
      document.body.appendChild(root);
    }

    const item = document.createElement('div');
    item.textContent = message;
    item.style.padding = '10px 12px';
    item.style.borderRadius = '10px';
    item.style.color = '#e2e8f0';
    item.style.fontSize = '13px';
    item.style.maxWidth = '300px';
    item.style.border = '1px solid #1f3344';
    item.style.background =
      type === 'success'
        ? 'rgba(16,185,129,.16)'
        : type === 'error'
          ? 'rgba(239,68,68,.2)'
          : type === 'warning'
            ? 'rgba(245,158,11,.2)'
            : 'rgba(14,165,161,.18)';

    root.appendChild(item);
    setTimeout(() => item.remove(), 3000);
  }

  success(message: string, title = 'Success'): void {
    this.push(`${title}: ${message}`, 'success');
  }

  error(message: string, title = 'Error'): void {
    this.push(`${title}: ${message}`, 'error');
  }

  info(message: string, title = 'Info'): void {
    this.push(`${title}: ${message}`, 'info');
  }

  warning(message: string, title = 'Warning'): void {
    this.push(`${title}: ${message}`, 'warning');
  }
}
