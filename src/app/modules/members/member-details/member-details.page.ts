import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
  WritableSignal
} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {formatDate} from '@angular/common';
import {AuthConstants} from 'src/app/core/config/auth-constants';
import {GroupMemberService} from 'src/app/core/services/group-member.service';
import {StatisticService} from 'src/app/core/services/statistic.service';
import {ToastService} from 'src/app/core/services/toast.service';
import {StorageService} from 'src/app/core/services/storage.service';
import Chart from 'chart.js/auto';
import {ConfirmService} from "../../../core/services/confirm.service";

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.page.html',
  styleUrls: ['./member-details.page.scss'],
  standalone: false,
})
export class MemberDetailsPage {

  public id: WritableSignal<string | null> = signal(null);
  // --- Services ---
  private route = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private groupMemberService = inject(GroupMemberService);
  private statisticService = inject(StatisticService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private navCtrl = inject(NavController);
  private confirmService = inject(ConfirmService);

  // --- Signals & State ---
  public teamMember = signal<any>(null);
  public measurements = signal<any[]>([]);
  public customFields = signal<any[]>([]);
  public parents = signal<any[]>([]);
  public categories = signal<any[]>([]);

  // Selection & UI State
  public selectedCategory = signal<any>(null);
  public selectedValue = signal<any>(null);
  public dateFrom = signal<any | null>(null);
  public dateTo = signal<string | null>(null);
  public maxDate = signal(new Date().toISOString());

  public isLoading = signal(true);
  public isChartLoading = signal(false);
  public editModalOpen = signal(false);
  public editableMeasurement = signal<any>({});

  // Computed Properties
  public showDeleteMember = signal(false);
  public measurementType = signal<string | null>(null);

  chartTitle: WritableSignal<string> = signal('');
  clicked: WritableSignal<boolean> = signal(false);
  canDeleteMeasurement: WritableSignal<boolean> = signal(false);
  measurement_type: WritableSignal<string | null> = signal(null);
  group: WritableSignal<any | null> = signal(null);

  private lineBar: Chart | undefined;
  @ViewChild('lineMeasurements') public lineMeasurements!: ElementRef;

  constructor() {
  }

  async ionViewWillEnter() {
    this.isLoading.set(true);
    const role = localStorage.getItem(AuthConstants.ROLE);

    this.group.set(JSON.parse(localStorage.getItem(AuthConstants.GROUP) as string));
    this.measurement_type.set(localStorage.getItem(AuthConstants.MEASUREMENT_TYPE));
    this.categories.set(JSON.parse(localStorage.getItem(AuthConstants.MEASUREMENT_CATEGORIES) as string) || []);

    this.canDeleteMeasurement.set(role === 'management' || role === 'top_coach');
    this.showDeleteMember.set(role === 'management' || role === 'top_coach');
    this.selectedCategory.set(null);
    this.selectedValue.set(null);

    const currentCategories = this.categories();
    const currentType = this.measurement_type();

    if (currentType === 'aggregate' && currentCategories.length > 0) {
      this.chartTitle.set(currentCategories[0].unit || '-');
    } else {
      this.chartTitle.set('-');
    }

    this.activatedRoute.params.subscribe(params => {
      const memberId = params['id'] ?? null;
      this.id.set(memberId);

      this.loadMemberInfo(memberId);
    });
  }

  async deleteMember() {
    const memberId = this.id();
    if (!memberId) return;

    const confirmed = await this.confirmService.confirmDelete();
    if (!confirmed) return;


    this.groupMemberService.delete({member_id: memberId}).subscribe({
      next: () => {
        this.navCtrl.pop(); // Go back to the list after deleting
      },
      error: (err) => {
        this.toastService.presentToast(err.error?.message || 'Error deleting member');
      }
    });
  }

  private loadMemberInfo(id: string) {
    this.isLoading.set(true);
    this.groupMemberService.show({id}).subscribe({
      next: async (data) => {
        this.teamMember.set(data.team_member);
        this.customFields.set(data.custom_fields);
        this.parents.set(data.parents);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  navigateTo(path: string, id: string | null) {
    if (id) {
      this.route.navigate([`./${path}`, id]);
    } else {
      this.route.navigate([`./${path}`]);
    }
  }

  loadChart() {
    this.isChartLoading.set(true);
    this.statisticService.chartForTeamMember({
      group_id: this.group().id,
      member_id: this.teamMember().member_id,
      date_from: this.dateFrom() ? formatDate(this.dateFrom()!, 'yyyy-MM-dd', 'en-US') : null,
      date_to: this.dateTo() ? formatDate(this.dateTo()!, 'yyyy-MM-dd', 'en-US') : formatDate(this.maxDate(), 'yyyy-MM-dd', 'en-US'),
      categories: this.categories(),
      category: this.selectedCategory(),
      category_value: this.selectedValue(),
    }).subscribe({
      next: (res: any) => {
        this.measurements.set(res.measurements || []);
        this.createLineChart();
        this.isChartLoading.set(false);
      },
      error: (err) => {
        this.isChartLoading.set(false);
        this.toastService.presentToast(this.translate.instant(err.error?.message || 'error'));
      }
    });
  }

  createLineChart() {
    if (this.lineBar) this.lineBar.destroy();

    const mType = this.measurementType();
    const data = this.measurements();
    const groupedData: any = {};

    data.forEach(m => {
      const category = (m.attributes?.map((a: any) => a.value).join(' ') || 'General').trim();
      if (!groupedData[category]) groupedData[category] = {labels: [], data: []};

      let val = mType === 'aggregate' ? m.value_time_formatted : parseFloat(m.value?.replace(/\s?(kg|m)$/, '') || '0');

      groupedData[category].labels.push(m.date_formatted);
      groupedData[category].data.push(val);
    });

    const datasets = Object.keys(groupedData).map((cat, i) => ({
      label: cat,
      data: groupedData[cat].data,
      borderColor: this.getRandomColor(i),
      fill: false
    }));

    this.lineBar = new Chart(this.lineMeasurements.nativeElement, {
      type: 'line',
      data: {
        labels: [...new Set(data.map(m => m.date_formatted))],
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {y: {ticks: {callback: (v) => mType === 'aggregate' ? new Date(Number(v) * 1000).toISOString().substring(11, 19) : v}}}
      }
    });
  }


  private getRandomColor(index: number): string {
    const colors = [
      'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)',
      'rgba(255, 159, 64, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 206, 86, 1)',
      'rgba(201, 203, 207, 1)', 'rgba(255, 0, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 0, 255, 1)'
    ];
    return colors[index % colors.length];
  }

  get editableMeasurementValue() {
    return this.editableMeasurement() || {value: ''};
  }

  async deleteMeasurement(item: any) {
    const confirmed = await this.confirmService.confirmDelete();
    if (!confirmed) return;

    this.statisticService.deleteMeasurement({
      member_id: this.teamMember().member_id,
      id: item.id,
    }).subscribe({
      next: () => {
        this.toastService.presentToast(this.translate.instant('measurement_deleted_success'));
        this.loadChart();
      },
      error: (err) => {
        this.toastService.presentToast(this.translate.instant(err?.error?.message || 'delete_error'));
      }
    });
  }

  editMeasurement(item: any) {
    this.editableMeasurement.set({...item}); // signal više nije null
    this.editModalOpen.set(true);
  }

  closeEditModal(): void {
    this.editModalOpen.set(false);
    this.editableMeasurement.set(null);
  }

  saveMeasurement(item: any): void {
    this.statisticService.updateMeasurement(item).subscribe({
      next: () => {
        this.editModalOpen.set(false);
        this.toastService.presentToast(this.translate.instant('measurement_updated_success'));
        this.loadChart();
      },
      error: (err) => {
        this.toastService.presentToast(this.translate.instant(err?.error?.message || 'update_error'));
      }
    });
  }

  updateEditableMeasurement(value: string | null | undefined) {
    const current = this.editableMeasurement() || {};
    this.editableMeasurement.set({...current, value: value ?? ''});
  }


  onDateFromChange(event: CustomEvent) {
    const value = event.detail?.value;

    if (typeof value === 'string') {
      this.dateFrom.set(value);
    }
  }

  onDateToChange(event: CustomEvent) {
    const value = event.detail?.value;

    if (typeof value === 'string') {
      this.dateTo.set(value);
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
    }
  }

  updateSelectedCategory(category: any) {
    this.selectedCategory.set(category);
  }

  updateSelectedValue(value: any) {
    this.selectedValue.set(value);
  }
}
