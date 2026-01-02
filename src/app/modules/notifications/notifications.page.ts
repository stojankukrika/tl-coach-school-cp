import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: false
})
export class NotificationsPage implements OnInit {
  private router = inject(Router);
  public notificationsService = inject(NotificationsService);
  public toastService = inject(ToastService);
  public translate = inject(TranslateService);

  // --- State Signals ---
  show: WritableSignal<boolean> = signal(false);
  notifications: WritableSignal<any[]> = signal([]);
  page: WritableSignal<number> = signal(0);
  nextPageUrl: WritableSignal<string | null> = signal('-');
  teamAppSettings: WritableSignal<any | null> = signal(null);

  showCreateNotification = computed(() => {
    const settings = this.teamAppSettings();
    return settings ? ('show' === settings.coach_can_make_notification) : false;
  });

  ngOnInit(): void { }

  ionViewWillEnter() {
    const settingsString = localStorage.getItem(AuthConstants.APPSETTINGS);
    this.teamAppSettings.set(settingsString ? JSON.parse(settingsString) : null);
    this.readData();
  }

  public readData(): void {
    this.show.set(false);
    this.notifications.set([]);
    this.page.set(0);
    this.nextPageUrl.set('-');
    this.loadingItems(null);
  }

  private loadingItems(ev: InfiniteScrollCustomEvent | null): void {
    const currentNextPageUrl = this.nextPageUrl();
    if (currentNextPageUrl === null && this.page() > 0) {
      if (ev) ev.target.complete();
      return;
    }

    this.page.update(p => p + 1);

    this.notificationsService.index({ page: this.page() }).pipe(
      finalize(() => { if (ev) ev.target.complete(); })
    ).subscribe({
      next: (data: any) => {
        const newItems = data.notifications.data.map((item: any) => ({
          ...item,
          isLoadingDetails: false // Initialize the detail loader for the accordion
        }));
        this.notifications.update(current => [...current, ...newItems]);
        this.nextPageUrl.set(data.notifications.next_page_url);
        this.show.set(true);
      },
      error: () => this.show.set(true)
    });
  }

  // Called when accordion opens
  onAccordionChange(event: any) {
    const selectedId = event.detail.value;
    if (!selectedId) return;

    // Find the item in the signal value
    const item = this.notifications().find(n => n.id == selectedId);
    if (!item) return;

    // 1. Mark as Read
    if (!item.read_at) {
      this.notificationsService.read(item).subscribe({
        next: () => {
          // ⭐️ Signal Update: Mutate the item inside the signal update function
          this.notifications.update(items => {
            const updatedItem = items.find(n => n.id === item.id);
            if (updatedItem) {
              updatedItem.read_at = new Date().toISOString();
            }
            return items; // Return the mutated array to trigger change detection
          });
        },
        error: (err: any) => console.error('Error marking notification as read', err)
      });
    }
  }

  showEvent(item: any) {
    if (item.event_id) {
      this.router.navigate(['./event-details/' + item.event_id]);
    }
  }

  onIonInfinite(ev: any): void {
    this.loadingItems(ev as InfiniteScrollCustomEvent);
  }

  create(): void {
    this.router.navigate(['./new-notification']);
  }
}
