import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { TrainingCalendarsServiceService } from 'src/app/core/services/training-calendars-service.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-training-calendars',
  templateUrl: './training-calendars.page.html',
  styleUrls: ['./training-calendars.page.scss'],
  standalone: false,
})
export class TrainingCalendarsPage implements OnInit {
  // --- Services ---
  private router = inject(Router);
  private trainingService = inject(TrainingCalendarsServiceService);
  private storage = inject(StorageService);

  // --- Signals (State) ---
  public group = signal<any>(null);
  public page = signal<number>(0);
  public show = signal<boolean>(false);
  public trainingCalendars = signal<any[]>([]);

  // Local object for monthly marking logic
  public monthlyMark = {
    member_id: null,
    mark: null,
    comment: null,
    team_group_training_calendar_id: null,
    team_group_id: null
  };

  ngOnInit() {}

  async ionViewWillEnter() {
    // Reset state on entry
    this.show.set(false);
    this.trainingCalendars.set([]);
    this.page.set(0);

    // REFACTORED: Loading Group from Native Storage (Async)
    const storedGroup = await this.storage.get(AuthConstants.GROUP);
    this.group.set(storedGroup);

    if (this.group()) {
      this.loadingItems(null);
    }
  }

  showTrainingCalendar(item: any) {
    this.router.navigate(['./training-calendar-result', item.id]);
  }

  addVideoTrainingCalendar(item: any) {
    this.router.navigate(['./training-calendar-video', item.id]);
  }

  private loadingItems(ev: any) {
    // Increment page signal
    this.page.update(p => p + 1);

    this.trainingService.index({
      team_group_id: this.group().id,
      page: this.page()
    }).subscribe({
      next: (data) => {
        const newItems = data.training_calendars.data;
        
        // Update list signal by appending new items
        this.trainingCalendars.update(current => [...current, ...newItems]);
        
        this.show.set(true);

        if (ev) {
          (ev as InfiniteScrollCustomEvent).target.complete();
          
          // Optional: Disable infinite scroll if no more data
          if (newItems.length === 0) {
             (ev as InfiniteScrollCustomEvent).target.disabled = true;
          }
        }
      },
      error: () => {
        this.show.set(true);
        if (ev) (ev as InfiniteScrollCustomEvent).target.complete();
      }
    });
  }

  onIonInfinite(ev: any) {
    this.loadingItems(ev);
  }
}