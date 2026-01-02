import {Component, inject, signal} from '@angular/core';
import {AuthConstants} from "src/app/core/config/auth-constants";
import {MembershipsService} from "src/app/core/services/memberships.service";

@Component({
  selector: 'app-memberships',
  templateUrl: './memberships-list.page.html',
  styleUrls: ['./memberships-list.page.scss'],
  standalone: false
})
export class MembershipsListPage {
  private membershipsService = inject(MembershipsService);

  // Signals
  show = signal(false);
  members = signal<any[]>([]);
  years = signal<any[]>([]);
  months = signal<any[]>([]);
  selectedYear = signal<string | null>(null);
  selectedMonth = signal<string | null>(null);
  isMembershipAmountSavedOpen = signal(false);

  group: any;

  ionViewWillEnter() {
    this.show.set(false);
    this.isMembershipAmountSavedOpen.set(false);
    this.loadInitialData();
  }

  private loadInitialData() {
    this.group = JSON.parse(localStorage.getItem(AuthConstants.GROUP) || '{}');
    const cachedMembers = JSON.parse(localStorage.getItem(AuthConstants.GROUP_MEMBERS) || '[]');

    // Inicijalizacija članova sa praznim iznosom
    const membersWithAmount = cachedMembers.map((m: any) => ({...m, amount: null}));
    this.members.set(membersWithAmount);

    this.readMemberships(null, null);
  }

  public readMemberships(year: any, month: any) {
    const params = {
      group_id: this.group.id,
      month: month,
      year: year
    };

    this.membershipsService.info(params).subscribe((response: any) => {
      this.years.set(response.years || []);
      this.months.set(response.months || []);
      this.selectedMonth.set(response.month);
      this.selectedYear.set(response.year?.toString());

      const memberships = response.memberships || {};

      // Mapiranje statusa na postojeće članove u signalu
      this.members.update(currentMembers =>
        currentMembers.map(member => {
          const statusList = memberships[member.member_id];
          return {
            ...member,
            membership_status: Array.isArray(statusList) ? statusList[0] : null
          };
        })
      );

      this.show.set(true);
    });
  }

  changeStatus(member: any, status: string) {
    const payload = {
      month: this.selectedMonth(),
      status,
      year: this.selectedYear(),
      member_id: member.member_id
    };

    this.membershipsService.changeStatus(payload).subscribe(() => {
      this.readMemberships(this.selectedYear(), this.selectedMonth());
    });
  }

  selectedMonthChange() {
    this.readMemberships(this.selectedYear(), this.selectedMonth());
  }

  setMembershipAmountSavedOpen(isOpen: boolean) {
    this.isMembershipAmountSavedOpen.set(isOpen);
  }

  saveEntry() {
    const membersToUpdate = this.members().filter(m => m.amount && m.amount !== '');

    if (membersToUpdate.length === 0) return;

    membersToUpdate.forEach((entry) => {
      const payment = {
        member_id: entry.member_id,
        date: new Date().toISOString(),
        amount: entry.amount, name: '',
        payment_slip_number: '',
        payer_name: '',
        payment_method: 'cash',
      };

      this.membershipsService.create(payment).subscribe(() => {
        // Resetuj iznos u signalu nakon uspešnog unosa
        this.members.update(prev =>
          prev.map(m => m.member_id === entry.member_id ? {...m, amount: null} : m)
        );
        this.isMembershipAmountSavedOpen.set(true);
      });
    });
  }
}
