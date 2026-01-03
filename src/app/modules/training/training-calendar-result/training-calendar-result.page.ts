import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingCalendarsServiceService } from "src/app/core/services/training-calendars-service.service";
import { ToastService } from "src/app/core/services/toast.service";
import { TranslateService } from "@ngx-translate/core";
import { AuthConstants } from "src/app/core/config/auth-constants";
import { EntryService } from "src/app/core/services/entry.service";

@Component({
  selector: 'app-training-calendar-result',
  templateUrl: './training-calendar-result.page.html',
  styleUrls: ['./training-calendar-result.page.scss'],
  standalone: false
})
export class TrainingCalendarResultPage {
  // Servisi
  private trainingCalendarsService = inject(TrainingCalendarsServiceService);
  private entryService = inject(EntryService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private activatedRoute = inject(ActivatedRoute);

  // Signals za stanje
  show = signal<boolean>(false);
  members = signal<any[]>([]);
  categories = signal<any[]>([]);
  trainingCalendar = signal<any>(null);

  // Form Signals
  selectedCategory = signal<any>(null);
  selectedValue = signal<any>(null);
  measurementKey = signal<string | null>(null);

  // Postavke
  measurementType = signal<string | null>(null);
  group = signal<any>(null);
  calendarId = signal<string | null>(null);

  // Computed properties
  showKey = computed(() => this.categories().length <= 0);

  ionViewWillEnter() {
    this.resetState();

    // Učitavanje iz lokala
    this.group.set(JSON.parse(localStorage.getItem(AuthConstants.GROUP) || '{}'));
    this.categories.set(JSON.parse(localStorage.getItem(AuthConstants.MEASUREMENT_CATEGORIES) || '[]'));
    this.measurementType.set(localStorage.getItem(AuthConstants.MEASUREMENT_TYPE));

    const cachedMembers = JSON.parse(localStorage.getItem(AuthConstants.GROUP_MEMBERS) || '[]');
    this.members.set(cachedMembers.map((m: any) => ({ ...m, value: null, read_only: false })));

    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.calendarId.set(params['id']);
        this.loadCalendarData(params['id']);
      }
    });
  }

  private resetState() {
    this.show.set(false);
    this.selectedCategory.set(null);
    this.selectedValue.set(null);
    this.measurementKey.set(null);
  }

  private loadCalendarData(id: string) {
    const data = {
      team_group_training_calendar_id: id,
      team_group_id: this.group().id,
    };

    this.trainingCalendarsService.show(id, data).subscribe({
      next: (res: any) => {
        this.trainingCalendar.set(res.training_calendar);
        this.show.set(true);
      }
    });
  }

  loadResults() {
    if (!this.selectedCategory() || !this.selectedValue()) return;

    const request_data = {
      category_id: this.selectedCategory().id,
      category_value: this.selectedValue(),
      team_group_training_calendar_id: this.calendarId(),
      team_group_id: this.group().id,
    };

    this.trainingCalendarsService.getMemberMonthlyResult(request_data).subscribe({
      next: (res: any) => {
        const measurementsMap = new Map<string, any>();
        res.measurements.forEach((m: any) => measurementsMap.set(m.member_id.toString(), m.value));

        this.members.update(currentMembers =>
          currentMembers.map(member => {
            const existingValue = measurementsMap.get(member.member_id?.toString() || member.id?.toString());
            return {
              ...member,
              value: existingValue ?? null,
              read_only: existingValue !== undefined && existingValue !== null
            };
          })
        );
      }
    });
  }

  saveMarkForMember() {
    const calendar = this.trainingCalendar();
    const currentMembers = this.members();

    // Filtriramo samo one koji imaju upisanu vrijednost i nisu read-only
    const entriesToSave = currentMembers.filter(m => m.value != null && m.value !== '' && !m.read_only);

    if (entriesToSave.length === 0) {
      this.toastService.presentToast(this.translate.instant('no_new_results'));
      return;
    }

    entriesToSave.forEach((entry) => {
      const data = {
        member_id: entry.member_id || entry.id,
        value: entry.value,
        date_time: new Date().toISOString(),
        group_id: calendar ? null : this.group().id,
        event_id: null,
        team_group_training_calendar_id: calendar?.id || null,
        key: this.categories().length > 0 ? '-' : this.measurementKey(),
        categories: this.categories(),
        category: this.selectedCategory(),
        category_value: this.selectedValue(),
      };

      this.entryService.measurement(data).subscribe();
    });

    this.toastService.presentToast(this.translate.instant('result_added'));

    // Resetuj unose koji nisu zaključani
    this.members.update(prev => prev.map(m => m.read_only ? m : { ...m, value: null }));

    // Ponovo učitaj rezultate da se polja zaključaju (read_only)
    setTimeout(() => this.loadResults(), 500);
  }
}
