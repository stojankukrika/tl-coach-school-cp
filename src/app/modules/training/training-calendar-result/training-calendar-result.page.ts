import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { EntryService } from 'src/app/core/services/entry.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TrainingCalendarsServiceService } from 'src/app/core/services/training-calendars-service.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-training-calendar-result',
  templateUrl: './training-calendar-result.page.html',
  styleUrls: ['./training-calendar-result.page.scss'],
  standalone: false,
})
export class TrainingCalendarResultPage implements OnInit {
  // --- Services ---
  private trainingService = inject(TrainingCalendarsServiceService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private activatedRoute = inject(ActivatedRoute);
  private entryService = inject(EntryService);
  private storage = inject(StorageService);

  // --- Signals (State) ---
  public members = signal<any[]>([]);
  public group = signal<any>(null);
  public trainingCalendar = signal<any>(null);
  public categories = signal<any[]>([]);
  public measurement_type = signal<string | null>(null);
  public selectedCategory = signal<any>(null);
  public selectedValue = signal<any>(null);
  
  public show = signal(false);
  public showKey = signal(false);
  public dataKey = signal<any | null>(null); // Replaces data.key

  private calendarId: string | null = null;

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.calendarId = params['id'] ?? null;
    });
  }

  async ionViewWillEnter() {
    this.show.set(false);
    this.selectedCategory.set(null);
    this.selectedValue.set(null);

    // REFACTORED: Load all data from Native Storage asynchronously
    const [members, group, categories, mType] = await Promise.all([
      this.storage.get(AuthConstants.GROUP_MEMBERS),
      this.storage.get(AuthConstants.GROUP),
      this.storage.get(AuthConstants.MEASUREMENT_CATEGORIES),
      this.storage.get(AuthConstants.MEASUREMENT_TYPE)
    ]);

    this.members.set(members || []);
    this.group.set(group);
    this.categories.set(categories || []);
    this.measurement_type.set(mType);
    this.showKey.set((categories || []).length <= 0);

    if (this.calendarId && this.group()) {
      const requestData = {
        team_group_training_calendar_id: this.calendarId,
        team_group_id: this.group().id,
      };

      this.trainingService.show(this.calendarId, requestData).subscribe((res) => {
        this.trainingCalendar.set(res.training_calendar);
        this.show.set(true);
      });
    }
  }

  /** Update member value in signal array */
  updateMemberValue(index: number, val: any) {
    this.members.update(current => {
      const updated = [...current];
      updated[index] = { ...updated[index], value: val };
      return updated;
    });
  }

  saveMarkForMember() {
    const calendar = this.trainingCalendar();
    const group = this.group();
    const currentMembers = this.members();

    currentMembers.forEach((entry) => {
      if (entry.value && entry.read_only !== true) {
        const payload = {
          member_id: entry.member_id,
          value: entry.value,
          date_time: new Date().toISOString(),
          group_id: calendar ? null : group.id,
          event_id: null,
          team_group_training_calendar_id: calendar?.id || null,
          key: this.categories().length > 0 ? '-' : this.dataKey(),
          categories: this.categories(),
          category: this.selectedCategory(),
          category_value: this.selectedValue(),
        };

        this.entryService.measurement(payload).subscribe(() => {
          entry.value = null; // Clear local value after success
        });
      }
    });

    this.toastService.presentToast(this.translate.instant('result_added'));
    this.loadResults();
  }

  loadResults() {
    if (!this.selectedCategory() || !this.selectedValue()) return;

    const request_data = {
      category_id: this.selectedCategory().id,
      category_value: this.selectedValue(),
      team_group_training_calendar_id: this.trainingCalendar().id,
      team_group_id: this.group().id,
    };

    this.trainingService.getMemberMonthlyResult(request_data).subscribe((data) => {
      const measurementsMap = new Map<string, string>();
      data.measurements.forEach((m: any) => measurementsMap.set(m.member_id, m.value));

      this.members.update(prev => prev.map(member => ({
        ...member,
        value: measurementsMap.get(member.member_id) || null,
        read_only: !!measurementsMap.get(member.member_id)
      })));
    });
  }
}