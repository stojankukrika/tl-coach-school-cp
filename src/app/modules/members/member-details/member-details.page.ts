import { Component, ElementRef, OnInit, ViewChild, inject, signal, WritableSignal, computed, effect } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { formatDate } from '@angular/common';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { GroupMemberService } from 'src/app/core/services/group-member.service';
import { StatisticService } from 'src/app/core/services/statistic.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { StorageService } from 'src/app/core/services/storage.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.page.html',
  styleUrls: ['./member-details.page.scss'],
  standalone: false,
})
export class MemberDetailsPage implements OnInit {
  public id: WritableSignal<string | null> = signal(null);
  // --- Services ---
  private route = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private groupMemberService = inject(GroupMemberService);
  private statisticService = inject(StatisticService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private navCtrl = inject(NavController);
  private storage = inject(StorageService);

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
  public isSubmitting = signal(false);
  public editModalOpen = signal(false);
  public editableMeasurement = signal<any>({});
  
  // Computed Properties
  public showDeleteMember = signal(false);
  public measurementType = signal<string | null>(null);
  public chartTitle = computed(() => {
    if (this.measurementType() === 'aggregate') {
      return this.categories().length > 0 ? this.categories()[0].unit : '-';
    }
    return this.selectedCategory()?.unit ?? '-';
  });

  private lineBar: Chart | undefined;
  @ViewChild('lineMeasurements') public lineMeasurements!: ElementRef;

  constructor() {
    // Re-render chart whenever measurements change
    effect(() => {
      if (this.measurements().length > 0 && this.lineMeasurements) {
        this.createLineChart();
      }
    });
  }

  ngOnInit() {}

async ionViewWillEnter() {
    this.isLoading.set(true);
    await this.initSettings();
    
    this.activatedRoute.params.subscribe(params => {
      // Set the ID signal so the HTML can see it
      const memberId = params['id'] ?? null;
      this.id.set(memberId); 
      
      this.loadMemberInfo(memberId);
    });
  }
deleteMember() {
    const memberId = this.id();
    if (!memberId) return;

    this.groupMemberService.delete({ member_id: memberId }).subscribe({
      next: () => {
        this.navCtrl.pop(); // Go back to the list after deleting
      },
      error: (err) => {
        this.toastService.presentToast(err.error?.message || 'Error deleting member');
      }
    });
  }
  private async initSettings() {
    const role = await this.storage.get(AuthConstants.ROLE);
    this.showDeleteMember.set(role === 'management' || role === 'top_coach');
    this.measurementType.set(await this.storage.get(AuthConstants.MEASUREMENT_TYPE));
  }

  private loadMemberInfo(id: string) {
    this.groupMemberService.show({ id }).subscribe({
      next: async (data) => {
        this.teamMember.set(data.team_member);
        this.customFields.set(data.custom_fields);
        this.parents.set(data.parents);
        
        this.categories.set(await this.storage.get(AuthConstants.MEASUREMENT_CATEGORIES) || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  /**
   * Universal Navigation Helper
   */
navigateTo(path: string, id: string | null) {
    if (id) {
      this.route.navigate([`./${path}`, id]);
    } else {
      this.route.navigate([`./${path}`]);
    }
  }

  loadData() {
    this.isSubmitting.set(true);
    const member = this.teamMember();
    
    this.statisticService.chartForTeamMember({
      group_id: member.team_id, // Example logic, adjust to your group storage if needed
      member_id: member.member_id,
      date_from: this.dateFrom() ? formatDate(this.dateFrom()!, 'yyyy-MM-dd', 'en-US') : null,
      date_to: this.dateTo() ? formatDate(this.dateTo()!, 'yyyy-MM-dd', 'en-US') : formatDate(this.maxDate(), 'yyyy-MM-dd', 'en-US'),
      categories: this.categories(),
      category: this.selectedCategory(),
      category_value: this.selectedValue(),
    }).subscribe({
      next: (res: any) => {
        this.measurements.set(res.measurements || []);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastService.presentToast(this.translate.instant(err.error?.message || 'Error'));
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
      if (!groupedData[category]) groupedData[category] = { labels: [], data: [] };
      
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
        scales: { y: { ticks: { callback: (v) => mType === 'aggregate' ? new Date(Number(v) * 1000).toISOString().substring(11, 19) : v } } }
      }
    });
  }

  deleteMeasurement(item: any) {
    const member = this.teamMember();
    this.statisticService.deleteMeasurement({ team_id: member.team_id, member_id: member.member_id, id: item.id })
      .subscribe(() => this.loadData());
  }

  saveMeasurement(item: any) {
    this.statisticService.updateMeasurement(item).subscribe(() => {
      this.editModalOpen.set(false);
      this.loadData();
    });
  }

  private getRandomColor(i: number) {
    const colors = ['#3880ff', '#2dd36f', '#eb445a', '#ffc409', '#92949c'];
    return colors[i % colors.length];
  }
}