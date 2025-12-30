import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { EntryService } from 'src/app/core/services/entry.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-members-presence',
  templateUrl: './members-presence.page.html',
  styleUrls: ['./members-presence.page.scss'],
  standalone: false,
})
export class MembersPresencePage implements OnInit {
  // --- Services ---
  private route = inject(Router);
  private entryService = inject(EntryService);
  private storage = inject(StorageService);

  // --- Signals & State ---
  public selectedDate = signal<any>(new Date().toISOString());
  public members: WritableSignal<any[]> = signal([]);
  public trainingDays: WritableSignal<any[]> = signal([]);
  public totalPresences: WritableSignal<{ [key: string]: number }> = signal({});
  
  // UI Flags
  public isLoading = signal(true);
  public showPayments = signal(false);
  public showAllPresenceStatuses = signal(true);

  constructor() {}

  ngOnInit(): void {}

  async ionViewWillEnter() {
    this.isLoading.set(true);
    await this.initSettings();
    await this.fetchData();
  }

  private async initSettings() {
    const settings = await this.storage.get(AuthConstants.APPSETTINGS);
    const role = await this.storage.get(AuthConstants.ROLE);

    this.showAllPresenceStatuses.set(!settings?.presence_chart || settings.presence_chart === 'all_values');
    this.showPayments.set(role === 'management' || role === 'top_coach');
  }

  /** Formats the date and triggers the API load */
  async fetchData() {
    this.isLoading.set(true);
    const date = new Date(this.selectedDate());
    const selectedMonth = ('0' + (date.getMonth() + 1)).slice(-2);
    const selectedYear = date.getFullYear();

    const group = await this.storage.get(AuthConstants.GROUP);
    
    const payload = {
      group_id: group.id,
      date: `${selectedYear}-${selectedMonth}`,
    };

    this.loadEntriesForMonth(payload);
  }

  private loadEntriesForMonth(payload: any) {
    this.entryService.presenceMonthly(payload).subscribe({
      next: (res: any) => {
        const tempTotals: { [key: string]: number } = {};
        const mappedMembers = res.members.map((m: any) => ({ ...m, presence: [] }));

        res.trainings.forEach((training: any) => {
          tempTotals[training.id] = 0;

          mappedMembers.forEach((member: any) => {
            const match = training.member_presences.find((p: any) => p.member_id === member.member_id);
            let status = '&nbsp;';

            if (match) {
              if (match.status_id === 1) {
                tempTotals[training.id]++;
                status = 'present';
              } else if (match.status_id === 2) status = 'sick';
              else if (match.status_id === 3) status = 'late';
              else if (match.status_id === 4) status = 'not_present';
            }
            member.presence.push(status);
          });
        });

        this.trainingDays.set(res.trainings);
        this.totalPresences.set(tempTotals);
        this.members.set(mappedMembers);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  memberDetails(member: any) {
    this.route.navigate(['./member-details', member.member_id || member.id]);
  }
}