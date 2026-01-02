import {Component, OnInit, signal, inject} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {AuthConstants} from 'src/app/core/config/auth-constants';
import {MembershipsService} from 'src/app/core/services/memberships.service';
import {MemberService} from "src/app/core/services/member.service";
import {ToastService} from "src/app/core/services/toast.service";

@Component({
  selector: 'app-memberships-statuses',
  templateUrl: './memberships-statuses.page.html',
  styleUrls: ['./memberships-statuses.page.scss'],
  standalone: false
})
export class MembershipsStatusesPage implements OnInit {
  private memberService = inject(MemberService);
  private membershipsService = inject(MembershipsService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  // Signals za reaktivnost
  show = signal(false);
  showMemberships = signal(false);
  showList = signal(false);

  memberId = signal<any>(null);
  memberName = signal<string>('');

  results = signal<any[]>([]);
  paidMemberships = signal<any[]>([]);
  membershipPayments = signal<any[]>([]);
  years = signal<any[]>([]);
  year = signal<any>(null);

  permissions = signal<string[]>([]);
  group: any;

  ngOnInit() {
    this.initPermissions();
  }

  ionViewWillEnter() {
    if (this.memberId()) {
      this.fetchMemberData({year: this.year(), member_id: this.memberId()});
    } else {
      this.loadInitialData();
    }
  }

  private initPermissions() {
    const permData = JSON.parse(localStorage.getItem(AuthConstants.PERMISSIONS) || '[]');
    this.permissions.set(permData);
    this.group = JSON.parse(localStorage.getItem(AuthConstants.GROUP) || '{}');
  }

  loadInitialData() {
    this.show.set(false);
    this.paidMemberships.set([]);

    if (this.permissions().includes('paid_memberships')) {
      this.membershipsService.lastThreeMonths({group_id: this.group.id}).subscribe((res: any) => {
        this.paidMemberships.set(res.paid_memberships);
        this.show.set(true);
      });
    } else {
      this.show.set(true);
    }
  }

  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.resetSelection();

    if (query.length > 1) {
      this.memberService.search({search: query}).subscribe((data) => {
        if (data.members.length > 0) {
          this.results.set(data.members);
          this.showList.set(true);
        } else {
          this.showList.set(false);
          this.loadInitialData();
        }
      });
    }
  }

  selectMember(member: any) {
    this.memberId.set(member.member_id);
    this.memberName.set(member.name);
    this.showList.set(false);
    this.fetchMemberData({year: null, member_id: member.member_id});
  }

  fetchMemberData(data: any) {
    this.showMemberships.set(false);
    if (!data.member_id) return;

    this.membershipsService.index(data).subscribe({
      next: (res: any) => {
        this.membershipPayments.set(res.membership_payments);
        this.paidMemberships.set(res.paid_memberships);
        this.years.set(res.years);
        this.year.set(res.year);
        this.showMemberships.set(true);
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Error loading data';
        this.toastService.presentToast(this.translate.instant(msg));
      }
    });
  }

  changeStatus(month: any, status: string) {
    const payload = {
      month,
      status,
      year: this.year(),
      member_id: this.memberId()
    };

    this.membershipsService.changeStatus(payload).subscribe((data: any) => {
      this.paidMemberships.set(data.paid_memberships);
    });
  }

  changedYear() {
    this.fetchMemberData({year: this.year(), member_id: this.memberId()});
  }

  addPayment() {
    this.router.navigate(['./membership-payment/' + this.memberId() + '/create']);
  }

  private resetSelection() {
    this.showList.set(false);
    this.showMemberships.set(false);
    this.memberName.set('');
    this.memberId.set(null);
    this.paidMemberships.set([]);
  }
}
