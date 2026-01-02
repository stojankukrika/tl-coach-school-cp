import { Component, OnInit, inject, signal, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, NavController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { EntryService } from 'src/app/core/services/entry.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-presence-table',
  templateUrl: './presence-table.page.html',
  styleUrls: ['./presence-table.page.scss'],
  standalone: false,
})
export class PresenceTablePage implements OnInit {
  @ViewChildren(IonItemSliding) slidingItems!: QueryList<IonItemSliding>;

  // --- Services ---
  private router = inject(Router);
  private entryService = inject(EntryService);
  private storage = inject(StorageService);
  private translate = inject(TranslateService);
public maxDate = signal<any>(new Date().toISOString());
  // --- Signals ---
  public members = signal<any[]>([]);
  public trainingDays = signal<any[]>([]);
  public totalPresences = signal<{ [key: string]: number }>({});
  public dateTime = signal<string | null>(null);
  public isLoading = signal(true);
  
  // Permissions & Settings
  public showPayments = signal(false);
  public showAllPresenceStatuses = signal(true);

  // Scroll Reference
  @ViewChild('tableWrapper', { read: ElementRef }) tableWrapper!: ElementRef;

  constructor() {}

  ngOnInit(): void {}

  async ionViewWillEnter() {
    this.isLoading.set(true);
    await this.initSettings();
    await this.loadData();
  }

  private async initSettings() {
    const settings = await this.storage.get(AuthConstants.APPSETTINGS);
    const role = await this.storage.get(AuthConstants.ROLE);
    
    this.showAllPresenceStatuses.set(!settings?.presence_chart || settings.presence_chart === 'all_values');
    this.showPayments.set(role === 'management' || role === 'top_coach');
  }

  public async loadData() {
    const groupMembers = await this.storage.get(AuthConstants.GROUP_MEMBERS) || [];
    this.members.set(groupMembers.map((m: any) => ({ ...m, presence: [] })));
    this.loadEntriesForMonth();
  }

  private async loadEntriesForMonth() {
    const group = await this.storage.get(AuthConstants.GROUP);
    const payload = { group_id: group.id };

    this.entryService.presenceMonthly(payload).subscribe({
      next: (res: any) => {
        this.dateTime.set(this.getTrainingForToday(res.trainings));
        const totals: { [key: string]: number } = {};
        
        // Map the presence matrix
        const updatedMembers = this.members().map(member => {
          const presenceRow = res.trainings.map((training:any) => {
            totals[training.id] = totals[training.id] || 0;
            const match = training.member_presences.find((p:any) => p.member_id === member.member_id);
            
            if (match?.status_id === 1) {
              totals[training.id]++;
              return 'present';
            }
            return this.mapStatus(match?.status_id);
          });
          return { ...member, presence: presenceRow };
        });

        this.totalPresences.set(totals);
        this.trainingDays.set(res.trainings);
        this.members.set(updatedMembers);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private mapStatus(id: number): string {
    const map:any = { 2: 'sick', 3: 'late', 4: 'not_present' };
    return map[id] || 'none';
  }

  private getTrainingForToday(trainings: any[]) {
    const today = new Date().toISOString().split('T')[0];
    const training = trainings.find(t => t.date === today);
    return training ? `${today} ${training.time_from}` : null;
  }

  // --- Actions ---
  presence(member: any, statusId: number = 1) {
    if (!this.dateTime()) return;
    const data = {
      member_id: member.member_id,
      status_id: statusId,
      date_time: this.dateTime(),
      group_id: member.group_id, // ensure group id is available on member object
    };
    this.entryService.presence(data).subscribe({
      next:()=>{
        this.closeAllSliders();
        this.loadEntriesForMonth();
      }});
  }
 private closeAllSliders() {
    this.slidingItems.forEach((slidingItem: IonItemSliding) => slidingItem.close());
  }
  scrollTable(direction: 'left' | 'right') {
    const element = this.tableWrapper.nativeElement;
    const scrollAmount = direction === 'left' ? -200 : 200;
    element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  navigateTo(path: string, params: any[] = []) {
    this.router.navigate([`./${path}`, ...params]);
  }
}