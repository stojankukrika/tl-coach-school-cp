import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthConstants } from "src/app/core/config/auth-constants";
import { EntryService } from "src/app/core/services/entry.service";

@Component({
  selector: 'app-presence-table',
  templateUrl: './presence-table.page.html',
  styleUrls: ['./presence-table.page.scss'],
  standalone: false
})
export class PresenceTablePage implements OnInit {

  private router = inject(Router);
  private entryService = inject(EntryService);

  show = signal(false);
  showPayments = signal(false);
  members = signal<any[]>([]);
  trainingDays = signal<any[]>([]);
  totalPresences = signal<Record<number, number>>({});
  dateTime = signal<string | null>(null);
  onHold = signal<number>(0);

  group: any;
  teamAppSettings: any;

  ngOnInit() {
    this.initData();
  }

  ionViewWillEnter() {
    this.initData();
  }

  private initData() {
    this.show.set(false);
    this.showPayments.set(false);
    this.teamAppSettings = JSON.parse(localStorage.getItem(AuthConstants.APPSETTINGS) || '{}');
    this.group = JSON.parse(localStorage.getItem(AuthConstants.GROUP) || '{}');

    if (['management', 'top_coach'].includes(localStorage.getItem(AuthConstants.ROLE) || '')) {
      this.showPayments.set(true);
    }

    const cachedMembers = JSON.parse(localStorage.getItem(AuthConstants.GROUP_MEMBERS) || '[]');
    this.members.set(cachedMembers);
    this.show.set(true);
    this.loadEntriesForMonth();
  }

  loadEntriesForMonth() {
    const data = { group_id: this.group.id };
    this.entryService.presenceMonthly(data).subscribe((res: any) => {
      const todayStr = new Date().toISOString().split('T')[0];
      this.dateTime.set(this.getTrainingForToday(res.trainings));
      this.onHold.set(this.members().filter(m => m.status === 'on_hold').length);

      const totals: Record<number, number> = {};
      const updatedMembers = this.members().map(m => ({ ...m, presence: [], todayStatus: 'none' }));

      res.trainings.forEach((training: any) => {
        totals[training.id] = 0;
        updatedMembers.forEach(member => {
          const presence = training.member_presences.find((p: any) => p.member_id === member.member_id);
          let status = 'none';

          if (presence) {
            if (presence.status_id === 1) {
              totals[training.id] += 1;              status = 'present';
            } else if (presence.status_id === 4) {
              status = 'not_present';
            } else {
              status = 'other';
            }
          }

          member.presence.push(status);
          // Ako je ovaj trening danas, postavi todayStatus za bojenje reda
          if (training.date === todayStr) {
            member.todayStatus = status;
          }
        });
      });

      this.totalPresences.set(totals);
      this.trainingDays.set(res.trainings);
      this.members.set(updatedMembers);
    });
  }

  presence(member: any, statusId: number) {
    if (!this.dateTime()) return;

    const data = {
      member_id: member.member_id,
      status_id: statusId,
      date_time: this.dateTime(),
      group_id: this.group.id,
    };

    // Odmah ažuriramo lokalni UI (Signal) radi brzine, pre nego što API odgovori
    const updated = this.members().map(m => {
      if (m.member_id === member.member_id) {
        return { ...m, todayStatus: statusId === 1 ? 'present' : 'not_present' };
      }
      return m;
    });
    this.members.set(updated);

    this.entryService.presence(data).subscribe({
      next: () => this.loadEntriesForMonth(),
      error: () => this.loadEntriesForMonth() // Vrati na staro ako pukne
    });
  }

  getTrainingForToday(trainings: any[]) {
    const today = new Date().toISOString().split('T')[0];
    const training = trainings.find(t => t.date === today);
    return training ? `${today} ${training.time_from}` : null;
  }

  // Navigacija ostaje ista...
  memberDetails(member: any) { this.router.navigate(['./member-details', member.id]); }
  trainingPlan(item: any, i: number) { this.router.navigate(['./training-plan', item.id, i]); }
  membershipStatuses() { this.router.navigate(['./memberships-statuses']); }
  memberships() { this.router.navigate(['./memberships']); }
  trainingCalendars() { this.router.navigate(['./training-calendars']); }
  membersPresences() { this.router.navigate(['./members-presence']); }
  measurements() { this.router.navigate(['./measurements', new Date().toISOString()]); }
}
