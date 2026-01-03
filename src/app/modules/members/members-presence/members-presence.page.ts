import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { GroupTrainingService } from 'src/app/core/services/group-training.service';
import { EntryService } from "src/app/core/services/entry.service";
import { AuthConstants } from "src/app/core/config/auth-constants";

@Component({
  selector: 'app-members-presence',
  templateUrl: './members-presence.page.html',
  styleUrls: ['./members-presence.page.scss'],
  standalone: false
})
export class MembersPresencePage implements ViewWillEnter {
  // Injekcija servisa
  private groupTrainingService = inject(GroupTrainingService);
  private entryService = inject(EntryService);
  private route = inject(Router);

  // Signals za reaktivno stanje
  selectedDate = signal<string>(new Date().toISOString());
  members = signal<any[]>([]);
  trainingDays = signal<any[]>([]);
  totalPresences = signal<Record<number, number>>({});

  // Postavke
  showPayments = signal<boolean>(false);
  teamAppSettings = signal<any>(null);

  constructor() {
    const settings = JSON.parse(localStorage.getItem(AuthConstants.APPSETTINGS) || '{}');
    this.teamAppSettings.set(settings);

    const role = localStorage.getItem(AuthConstants.ROLE);
    if (role === 'management' || role === 'top_coach') {
      this.showPayments.set(true);
    }
  }

  ionViewWillEnter() {
    // Inicijalno punjenje iz lokala da ekran ne bude prazan dok traje API poziv
    const cachedMembers = JSON.parse(localStorage.getItem(AuthConstants.GROUP_MEMBERS) || '[]');
    this.members.set(cachedMembers);
    this.fetchData();
  }

  fetchData() {
    const dateObj = new Date(this.selectedDate());
    const selectedMonth = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const selectedYear = dateObj.getFullYear();

    const group = JSON.parse(localStorage.getItem(AuthConstants.GROUP) || '{}');

    const data = {
      group_id: group.id,
      date: `${selectedYear}-${selectedMonth}`,
    };

    this.loadEntriesForMonth(data);
  }

  private loadEntriesForMonth(data: any) {
    this.entryService.presenceMonthly(data).subscribe({
      next: (res: any) => {
        // Priprema članova sa praznim nizom prisustva
        const newMembers = res.members.map((m: any) => ({ ...m, presence: [] }));
        const totals: Record<number, number> = {};

        res.trainings.forEach((training: any) => {
          totals[training.id] = 0;

          newMembers.forEach((member: any) => {
            const presence = training.member_presences.find((p: any) => p.member_id === member.member_id);

            if (presence) {
              const statusMap: Record<number, string> = {
                1: 'present',
                2: 'sick',
                3: 'late',
                4: 'not_present'
              };

              const status = statusMap[presence.status_id] || 'unknown';
              member.presence.push(status);

              if (presence.status_id === 1) {
                totals[training.id] += 1;
              }
            } else {
              member.presence.push('none');
            }
          });
        });

        // Ažuriranje signala (ovo automatski osvježava HTML)
        this.members.set(newMembers);
        this.trainingDays.set(res.trainings);
        this.totalPresences.set(totals);
      }
    });
  }

  memberDetails(member: any) {
    this.route.navigate(['./member-details', member.id]);
  }
}
