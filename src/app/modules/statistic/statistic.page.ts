import { Component, ElementRef, OnInit, ViewChild, inject, signal, effect } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { StatisticService } from 'src/app/core/services/statistic.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { StorageService } from 'src/app/core/services/storage.service';

Chart.register(...registerables);

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.page.html',
  styleUrls: ['./statistic.page.scss'],
  standalone: false,
})
export class StatisticPage {
  // --- Services ---
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private statisticService = inject(StatisticService);
  private storage = inject(StorageService);

  // --- View Children ---
  @ViewChild('barPresents') public barPresents!: ElementRef;
  @ViewChild('doughnutPresents') public doughnutPresents!: ElementRef;

  // --- Signals (State) ---
  public group = signal<any>(null);
  public members = signal<any[]>([]);
  public member = signal<any>(null);
  public teamAppSettings = signal<any>(null);
  public presentsEvents = signal<any[]>([]);
  public showCalendar = signal(false);
  public showEntries = signal(false);

  // --- Chart Instances ---
  private barChart: any;
  private doughnutChart: any;

  // --- Data holders for Charts ---
  private chartBarLabels: string[] = [];
  private chartBarPresent: number[] = [];
  private chartBarLate: number[] = [];
  private chartBarSick: number[] = [];
  private chartBarNotPresent: number[] = [];
  
  private doughnutData = { present: 0, late: 0, sick: 0, notPresent: 0 };

  async ionViewDidEnter() {
    // REFACTORED: Loading from Native Storage
    const [group, members, settings] = await Promise.all([
      this.storage.get(AuthConstants.GROUP),
      this.storage.get(AuthConstants.GROUP_MEMBERS),
      this.storage.get(AuthConstants.APPSETTINGS)
    ]);

    this.group.set(group);
    this.members.set(members || []);
    this.teamAppSettings.set(settings || {});

    this.resetChartData();
    this.getDataForGroup();
  }

  ionViewDidLeave() {
    if (this.barChart) this.barChart.destroy();
    if (this.doughnutChart) this.doughnutChart.destroy();
  }

  private resetChartData() {
    this.chartBarLabels = [];
    this.chartBarPresent = [];
    this.chartBarLate = [];
    this.chartBarSick = [];
    this.chartBarNotPresent = [];
    this.doughnutData = { present: 0, late: 0, sick: 0, notPresent: 0 };
    this.showEntries.set(false);
    this.showCalendar.set(false);
  }

  getDataForGroup() {
    if (!this.group()) return;

    this.statisticService.index({ group_id: this.group().id }).subscribe({
      next: (res) => {
        this.processPresenceData(res.presence);
        this.renderCharts();
      },
      error: (err) => this.handleError(err)
    });
  }

  changedMember(event: any) {
    const memberId = event.detail.value;
    this.member.set(memberId);
    this.showEntries.set(false);
    this.showCalendar.set(false);
    this.presentsEvents.set([]);
    
    this.loadDataForCharts();
    this.loadDataForCalendar();
  }

  private processPresenceData(presence: any[]) {
    this.resetChartData();
    const settings = this.teamAppSettings();

    presence.forEach(element => {
      if (!this.chartBarLabels.includes(element.new_date)) {
        this.chartBarLabels.push(element.new_date);
      }
      this.chartBarPresent.push(element.present);
      this.chartBarNotPresent.push(element.not_present);

      this.doughnutData.present += element.present;
      this.doughnutData.notPresent += element.not_present;

      if (!settings.presence_chart || settings.presence_chart === 'all_values') {
        this.chartBarLate.push(element.late);
        this.chartBarSick.push(element.sick);
        this.doughnutData.sick += element.sick;
        this.doughnutData.late += element.late;
      }
    });
  }

  private renderCharts() {
    if (this.barChart) this.barChart.destroy();
    if (this.doughnutChart) this.doughnutChart.destroy();

    const settings = this.teamAppSettings();
    const isFullDataset = !settings.presence_chart || settings.presence_chart === 'all_values';

    // Configure Bar Datasets
    const barDatasets = [
      { label: this.translate.instant('present'), data: this.chartBarPresent, backgroundColor: '#16a34a' },
      { label: this.translate.instant('notPresent'), data: this.chartBarNotPresent, backgroundColor: '#ef4444' }
    ];

    if (isFullDataset) {
      barDatasets.splice(1, 0, 
        { label: this.translate.instant('late'), data: this.chartBarLate, backgroundColor: '#a855f7' },
        { label: this.translate.instant('sick'), data: this.chartBarSick, backgroundColor: '#f59e0b' }
      );
    }

    this.barChart = new Chart(this.barPresents.nativeElement, {
      type: 'bar',
      data: { labels: this.chartBarLabels, datasets: barDatasets as any },
      options: { responsive: true }
    });

    // Configure Doughnut
    const doughnutLabels = isFullDataset 
      ? [this.translate.instant('present'), this.translate.instant('late'), this.translate.instant('sick'), this.translate.instant('notPresent')]
      : [this.translate.instant('present'), this.translate.instant('notPresent')];

    const doughnutValues = isFullDataset
      ? [this.doughnutData.present, this.doughnutData.late, this.doughnutData.sick, this.doughnutData.notPresent]
      : [this.doughnutData.present, this.doughnutData.notPresent];

    this.doughnutChart = new Chart(this.doughnutPresents.nativeElement, {
      type: 'doughnut',
      data: {
        labels: doughnutLabels,
        datasets: [{
          data: doughnutValues,
          backgroundColor: isFullDataset ? ['#16a34a', '#a855f7', '#f59e0b', '#ef4444'] : ['#16a34a', '#ef4444']
        }]
      }
    });
  }

  private loadDataForCharts() {
    this.statisticService.forTeamMember({ group_id: this.group().id, member_id: this.member() }).subscribe({
      next: (res) => {
        this.processPresenceData(res.presence);
        this.renderCharts();
        this.showEntries.set(true);
      },
      error: (err) => this.handleError(err)
    });
  }

  private loadDataForCalendar() {
    this.statisticService.forTeamMemberAll({ group_id: this.group().id, member_id: this.member() }).subscribe({
      next: (res) => {
        const events = res.presence.map((element: any) => ({
          date: element.date_formated,
          textColor: '#ffffff',
          backgroundColor: this.getStatusColor(element.status_id)
        }));
        this.presentsEvents.set(events);
        this.showCalendar.set(true);
      },
      error: (err) => this.handleError(err)
    });
  }

  private getStatusColor(statusId: number): string {
    const colors: { [key: number]: string } = { 1: '#16a34a', 2: '#a855f7', 3: '#f59e0b', 4: '#FF1616' };
    return colors[statusId] || '#cccccc';
  }

  private handleError(err: any) {
    const msg = err?.error?.message || 'error_loading_data';
    this.toastService.presentToast(this.translate.instant(msg));
  }
}