import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { TrainingCalendarsServiceService } from 'src/app/core/services/training-calendars-service.service';

@Component({
  selector: 'app-training-calendars',
  templateUrl: './training-calendars.page.html',
  styleUrls: ['./training-calendars.page.scss'],
  standalone: false
})
export class TrainingCalendarsPage {
  // Servisi
  private router = inject(Router);
  private trainingService = inject(TrainingCalendarsServiceService);

  // Signals za stanje
  show = signal<boolean>(false);
  trainingCalendars = signal<any[]>([]);
  page = signal<number>(0);

  private group: any;

  ionViewWillEnter() {
    this.show.set(false);
    this.trainingCalendars.set([]);
    this.page.set(0);
    this.group = JSON.parse(localStorage.getItem(AuthConstants.GROUP) || '{}');
    this.loadingItems(null);
  }

  showTrainingCalendar(item: any) {
    this.router.navigate(['./training-calendar-result', item.id]);
  }

  addVideoTrainingCalendar(item: any) {
    this.router.navigate(['./training-calendar-video', item.id]);
  }

  private loadingItems(ev: InfiniteScrollCustomEvent | null) {
    this.page.update(p => p + 1);

    this.trainingService.index({
      team_group_id: this.group.id,
      page: this.page()
    }).subscribe({
      next: (res: any) => {
        const newData = res.training_calendars.data;

        // Dodajemo nove podatke u postojeći niz unutar signala
        this.trainingCalendars.update(current => [...current, ...newData]);

        this.show.set(true);

        if (ev) {
          ev.target.complete();
          // Opcionalno: Isključi infinite scroll ako nema više podataka
          if (newData.length === 0) {
            ev.target.disabled = true;
          }
        }
      },
      error: () => {
        this.show.set(true);
        if (ev) ev.target.complete();
      }
    });
  }

  onIonInfinite(ev: any) {
    this.loadingItems(ev as InfiniteScrollCustomEvent);
  }
}
