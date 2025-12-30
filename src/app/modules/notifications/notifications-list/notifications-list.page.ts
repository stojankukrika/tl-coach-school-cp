import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/core/services/notifications.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.page.html',
  styleUrls: ['./notifications-list.page.scss'],
  standalone: false,
})
export class NotificationsListPage implements OnInit {
  // --- Services Injected via inject() ---
  private router = inject(Router);
  private notificationsService = inject(NotificationsService);

  // --- Signals & State ---
  public notifications: WritableSignal<any[]> = signal([]);
  public isLoading: WritableSignal<boolean> = signal(true);

  constructor() {}

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.readData();
  }

  /**
   * Fetches notification data and updates signals
   */
  public readData(): void {
    this.isLoading.set(true);
    
    this.notificationsService.index().subscribe({
      next: (data: any) => {
        // Handle potential null/undefined from API
        this.notifications.set(data?.notifications?.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        // Add toast error handling here if needed
      }
    });
  }

  /**
   * Universal navigation function for cleaner HTML
   */
  navigateTo(path: string, id?: string | number): void {
    const route = id ? [`./${path}`, id] : [`./${path}`];
    this.router.navigate(route);
  }

  /**
   * Marks notification as read and navigates to details
   */
  showItem(item: any): void {
    this.notificationsService.read(item).subscribe({
      next: () => {
        this.navigateTo('notification', item.id);
      },
      error: () => {
        // Navigate anyway even if marking as read fails locally
        this.navigateTo('notification', item.id);
      }
    });
  }
}