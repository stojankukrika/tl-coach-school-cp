import {Component, inject, signal, WritableSignal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NavController} from '@ionic/angular';
import {AuthConstants} from 'src/app/core/config/auth-constants';
import {EntryService} from 'src/app/core/services/entry.service';
import {from} from 'rxjs';
import {concatMap} from 'rxjs/operators';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-measurements',
  templateUrl: './measurements.page.html',
  styleUrls: ['./measurements.page.scss'],
  standalone: false,
})
export class MeasurementsPage {
  // Signals za sve vrijednosti
  group: WritableSignal<any> = signal<any>(null);
  show: WritableSignal<boolean> = signal<boolean>(false);
  hideMe: WritableSignal<{ [key: string]: boolean }> = signal<{ [key: string]: boolean }>({});
  isToastMeasurementOpen: WritableSignal<boolean> = signal<boolean>(false);
  type: WritableSignal<any> = signal<any>(null);
  types: WritableSignal<any[]> = signal<any[]>([]);
  members: WritableSignal<any[]> = signal<any[]>([]);
  datetime: WritableSignal<any> = signal<any>(null);
  date: WritableSignal<any> = signal<any>(null);
  key: WritableSignal<any> = signal<any>(null);
  event: WritableSignal<any> = signal<any>(null);
  categories: WritableSignal<any[]> = signal<any[]>([]);
  isEvent: WritableSignal<boolean> = signal<boolean>(false);
  notPresentMembers: WritableSignal<any[]> = signal<any[]>([]);
  lateMembers: WritableSignal<any[]> = signal<any[]>([]);
  sickMembers: WritableSignal<any[]> = signal<any[]>([]);
  presentMembers: WritableSignal<any[]> = signal<any[]>([]);
  teamAppSettings: WritableSignal<any> = signal<any>(null);
  showAllPresenceStatuses: WritableSignal<boolean> = signal<boolean>(false);
  permissions: WritableSignal<any> = signal<any>(null);
  showMeasurements: WritableSignal<boolean> = signal<boolean>(false);
  isToastNoteOpen: WritableSignal<boolean> = signal<boolean>(false);
  showKey: WritableSignal<boolean> = signal<boolean>(false);
  disabled: WritableSignal<boolean> = signal<boolean>(false);
  data: WritableSignal<any> = signal<any>({member_id: null, key: null, value: null});
  measurement_type: WritableSignal<any> = signal<any>(null);
  selectedCategory: WritableSignal<any> = signal<any>(null);
  selectedValue: WritableSignal<any> = signal<any>(null);
  title: WritableSignal<any> = signal<any>(null);

  public activatedRoute = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private entryService = inject(EntryService);

  constructor() {
  }

  ionViewWillEnter() {
    this.disabled.set(false);
    this.teamAppSettings.set(JSON.parse(localStorage.getItem(AuthConstants.APPSETTINGS) || '{}'));
    this.permissions.set(JSON.parse(localStorage.getItem(AuthConstants.PERMISSIONS) || '[]'));
    this.showMeasurements.set((this.permissions() != null && this.permissions().includes('measurements')));

    this.showAllPresenceStatuses.set(
      (!this.teamAppSettings().presence_chart || 'all_values' === this.teamAppSettings().presence_chart)
    );
    this.hideMe.set({});
    this.show.set(false);
    this.showKey.set(false);
    this.data.set({member_id: null, key: null, value: null});
    this.isToastMeasurementOpen.set(false);
    this.isToastNoteOpen.set(false);

    this.activatedRoute.params.subscribe(params => {
      this.datetime.set(params['time'] ?? null);
      if (params['event'] !== undefined) {
        this.event.set(params['event']);
        this.isEvent.set(true);
        this.title.set('event_results');
      } else {
        this.isEvent.set(false);
        this.title.set('measurement');
        this.group.set(JSON.parse(localStorage.getItem(AuthConstants.GROUP) || '{}'));
      }
      this.loadData();
    });
  }

  public loadData() {
    this.key.set('');
    const membersData = JSON.parse(localStorage.getItem(AuthConstants.GROUP_MEMBERS) || '[]');
    this.members.set(membersData);

    const hideMeData: { [key: string]: boolean } = {};
    membersData.forEach((element: any) => {
      hideMeData[element.id] = false;
    });
    this.hideMe.set(hideMeData);

    this.categories.set(JSON.parse(localStorage.getItem(AuthConstants.MEASUREMENT_CATEGORIES) || '[]'));
    this.measurement_type.set(localStorage.getItem(AuthConstants.MEASUREMENT_TYPE));
    this.selectedCategory.set(null);
    this.selectedValue.set(null);
    this.show.set(true);
    this.loadEntriesForDate();
    if (this.measurement_type() !== 'individual') {
      setTimeout(() => this.loadLastCategoryMeasurements(), 200);
    }
  }

  loadEntriesForDate() {
    this.showKey.set(this.categories().length <= 0);
  }

  saveEntry() {
    this.disabled.set(true);
    if (this.measurement_type() !== 'individual') {
      this.loadLastCategoryMeasurements();
    }
    const entriesToProcess = this.members()
      .filter((entry: any) => entry.value != "" && entry.value != null)
      .map((entry: any) => {
        const data: any = {
          member_id: entry.member_id,
          value: entry.value,
          date_time: this.datetime(),
          group_id: null,
          event_id: null,
          categories: this.categories(),
          category: this.selectedCategory(),
          category_id: this.selectedCategory()?.id,
          category_value: this.selectedValue(),
          key: null,
        };

        if (this.event() !== null) {
          data.event_id = this.event();
        } else {
          data.group_id = this.group().id;
        }
        data.key = this.data().key || '-';

        return data;
      });

    if (entriesToProcess.length === 0) {
      this.setMeasurementOpen(true);

      if (this.measurement_type() === 'individual') {
        this.changeCategoryValue();
      } else {
        this.loadLastCategoryMeasurements();
      }
      return;
    }

    from(entriesToProcess)
      .pipe(
        concatMap((data) => {
          if (this.measurement_type() === 'individual') {
            return this.entryService.deleteLastMeasurements(data).pipe(
              concatMap(() => this.entryService.measurement(data))
            );
          } else {
            return this.entryService.measurement(data);
          }
        })
      )
      .subscribe({
        next: () => {
        },
        complete: () => {
          this.setMeasurementOpen(true);
          if (this.measurement_type() === 'individual') {
            this.changeCategoryValue();
          } else {
            this.loadLastCategoryMeasurements();
          }
          this.disabled.set(false);
        },
        error: (err) => {
          console.error('Greška pri slanju mjerenja:', err);
          this.setMeasurementOpen(true);

          if (this.measurement_type() === 'individual') {
            this.changeCategoryValue();
          } else {
            this.loadLastCategoryMeasurements();
          }
          this.disabled.set(false);
        },
      });
  }

  setMeasurementOpen(isOpen: boolean) {
    this.isToastMeasurementOpen.set(isOpen);
  }

  setNoteOpen(isOpen: boolean) {
    this.isToastNoteOpen.set(isOpen);
  }

  changeCategoryValue() {
    const data = {
      date_time: this.datetime(),
      category_id: this.selectedCategory()?.id,
      category_value: this.selectedValue(),
      group_id: this.group()?.id
    };
    this.entryService.lastMeasurements(data).subscribe((response: any) => {
      const measurements = response.measurements || [];
      const measurementMap = new Map(
        measurements.map((item: any) => [item.member_id, item.value])
      );

      this.members.update(members =>
        members.map((member: any) => {
          const match = measurementMap.get(member.member_id);
          return {
            ...member,
            value: match ? match : null,
          };
        })
      );
    });
  }

  updateDataKey(key: string | null | undefined) {
    if (key !== null && key !== undefined) {
      this.data.update(current => ({...current, key}));
    }
  }

  updateSelectedCategory(category: any) {
    this.selectedCategory.set(category);
  }

  updateSelectedValue(value: any) {
    this.selectedValue.set(value);
    this.changeCategoryValue();
  }

  updateMemberValue(memberId: string, value: string | null | undefined) {
    if (value !== null && value !== undefined) {
      this.members.update(members =>
        members.map((member: any) =>
          member.member_id === memberId
            ? {...member, value}
            : member
        )
      );
    }
  }

  loadLastCategoryMeasurements() {
    if (this.measurement_type() === 'individual') {
      const activeCategory = this.categories().find(cat => cat.value) || this.categories()[0];
      if (!activeCategory) {
        return;
      }
      const data = {
        date_time: this.datetime(),
        category_id: activeCategory.id,
        category_value: activeCategory.value,
        group_id: this.group()?.id
      };

      this.entryService.lastMeasurements(data).subscribe((response: any) => {
        const measurements = response.measurements || [];
        const measurementMap = new Map(
          measurements.map((item: any) => [item.member_id, item.value])
        );

        this.members.update(members =>
          members.map((member: any) => {
            const match = measurementMap.get(member.member_id);
            return {
              ...member,
              value: match ? match : null,
            };
          })
        );
      });
    }
  }

  updateCategoryValue(categoryId: string, value: string | null | undefined) {
    if (value !== null && value !== undefined) {
      this.categories.update(categories =>
        categories.map((category: any) =>
          category.id === categoryId
            ? {...category, value}
            : category
        )
      );
      setTimeout(() => this.loadLastCategoryMeasurements(), 100);
    }
  }
}
