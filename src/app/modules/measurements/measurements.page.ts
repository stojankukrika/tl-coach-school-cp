import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { EntryService } from 'src/app/core/services/entry.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-measurements',
  templateUrl: './measurements.page.html',
  styleUrls: ['./measurements.page.scss'],
  standalone: false,
})
export class MeasurementsPage implements OnInit {
  // --- Services ---
  private activatedRoute = inject(ActivatedRoute);
  private entryService = inject(EntryService);
  private storage = inject(StorageService);
  private toastService = inject(ToastService);

  // --- Signals & State ---
  public members: WritableSignal<any[]> = signal([]);
  public categories: WritableSignal<any[]> = signal([]);
  public group: WritableSignal<any> = signal(null);
  
  // Selection State
  public selectedCategory: WritableSignal<any> = signal(null);
  public selectedValue: WritableSignal<any> = signal(null);
  public datetime: WritableSignal<string | null> = signal(null);
  public measurementType: WritableSignal<string | null> = signal(null);
  // UI Flags
  public isLoading: WritableSignal<boolean> = signal(true);
  public isEvent: WritableSignal<boolean> = signal(false);
  public showMeasurements: WritableSignal<boolean> = signal(false);
  public isToastOpen: WritableSignal<boolean> = signal(false);

  // Computed signal for logic
  public showKey = computed(() => this.categories().length <= 0);

  constructor() {}

  ngOnInit(): void {}

  async ionViewWillEnter() {
    this.isLoading.set(true);
    await this.initSettings();
    
    this.activatedRoute.params.subscribe(async (params) => {
      this.datetime.set(params['time'] ?? null);
      
      if (params['event'] !== undefined) {
        this.isEvent.set(true);
      } else {
        this.isEvent.set(false);
        const savedGroup = await this.storage.get(AuthConstants.GROUP);
        this.group.set(savedGroup);
      }
      await this.loadData();
    });
  }

  private async initSettings() {
    const permissions = await this.storage.get(AuthConstants.PERMISSIONS);
    this.showMeasurements.set(permissions?.includes('measurements') || false);
  }

  public async loadData() {
    const groupMembers = await this.storage.get(AuthConstants.GROUP_MEMBERS);
    const measurementCats = await this.storage.get(AuthConstants.MEASUREMENT_CATEGORIES);
    
    this.members.set(groupMembers || []);
    this.categories.set(measurementCats || []);
    this.isLoading.set(false);
  }

  /**
   * Refactored save logic using RxJS forkJoin or sequential mapping
   * Updates multiple member entries and clears local values
   */
  async saveEntry() {
    const category = this.selectedCategory();
    if (!category) return;

    this.isLoading.set(true);
    const currentMembers = this.members();

    // Preparation of shared data
    const baseData = {
      date_time: this.datetime(),
      category_id: category.id,
      category_value: this.selectedValue(),
      group_id: this.group()?.id
    };

    // Note: In a real app, a single bulk API endpoint is better.
    // Here we maintain your logic of deleting then inserting.
    this.entryService.deleteLastMeasurements(baseData).subscribe({
      next: () => {
        currentMembers.forEach((member) => {
          if (member.value) {
            const measurementData = {
              ...baseData,
              member_id: member.member_id,
              value: member.value,
              categories: this.categories(),
              category: category,
            };
            
            this.entryService.measurement(measurementData).subscribe(() => {
              member.value = null; // Clear local signal value
            });
          }
        });
        this.isToastOpen.set(true);
        this.isLoading.set(false);
        this.changeCategoryValue();
      },
      error: () => this.isLoading.set(false)
    });
  }

  /**
   * Fetches latest values when category selection changes
   */
  changeCategoryValue() {
    const category = this.selectedCategory();
    if (!category) return;

    const query = {
      date_time: this.datetime(),
      category_id: category.id,
      category_value: this.selectedValue(),
      group_id: this.group()?.id
    };

    this.entryService.lastMeasurements(query).subscribe((response: any) => {
      const measurements = response.measurements || [];
      const measurementMap = new Map(measurements.map((item: any) => [item.member_id, item.value]));

      // Update members signal immutably
      this.members.update(prev => prev.map(member => ({
        ...member,
        value: measurementMap.get(member.member_id) ?? null
      })));
    });
  }
}