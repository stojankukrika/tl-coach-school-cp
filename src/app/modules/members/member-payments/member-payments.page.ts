import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MemberService } from 'src/app/core/services/member.service';
import { MembershipsService } from 'src/app/core/services/memberships.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-member-payments',
  templateUrl: './member-payments.page.html',
  styleUrls: ['./member-payments.page.scss'],
  standalone: false,
})
export class MemberPaymentsPage implements OnInit {
  // --- Services Injected ---
  private memberService = inject(MemberService);
  private membershipsService = inject(MembershipsService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private router = inject(Router);

  // --- Signals & State ---
  public searchResults: WritableSignal<any[]> = signal([]);
  public membershipPayments: WritableSignal<any[]> = signal([]);
  public paidMemberships: WritableSignal<any[]> = signal([]);
  public paidLicense: WritableSignal<any | null> = signal(null);
  public years: WritableSignal<number[]> = signal([]);
  
  public selectedYear: WritableSignal<number | null> = signal(null);
  public memberId: WritableSignal<string | null> = signal(null);
  public memberName: WritableSignal<string | null> = signal(null);

  // UI States
  public isSearchVisible: WritableSignal<boolean> = signal(false);
  public isPaymentsVisible: WritableSignal<boolean> = signal(false);
  public isSubmitting: WritableSignal<boolean> = signal(false);

  // Computed: Only show the "Add Payment" button if a member is selected
  public hasMemberSelected = computed(() => !!this.memberId());

  constructor() {}

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.isPaymentsVisible.set(false);
    this.isSearchVisible.set(false);
    this.refreshData();
  }

  /** Handles Member Search via Searchbar */
  handleSearch(event: any) {
    const query = event.target.value?.toLowerCase() || '';
    this.isSearchVisible.set(false);
    this.memberName.set(null);
    this.memberId.set(null);
    this.isPaymentsVisible.set(false);

    if (query.length > 1) {
      this.memberService.search({ search: query }).subscribe({
        next: (data) => {
          this.searchResults.set(data.members || []);
          this.isSearchVisible.set(true);
        }
      });
    }
  }

  /** Selects a member from the search results */
  selectMember(member: any) {
    this.memberId.set(member.member_id);
    this.memberName.set(member.name);
    this.isSearchVisible.set(false);
    this.fetchPayments({ year: null, member_id: member.member_id });
  }

  /** Wrapper for refreshing data with current selections */
  refreshData() {
    this.fetchPayments({ 
      year: this.selectedYear(), 
      member_id: this.memberId() 
    });
  }

  /** Core API call to retrieve membership/payment data */
  private fetchPayments(data: any) {
    this.isPaymentsVisible.set(false);
    
    if (this.memberId()) {
      this.membershipsService.index(data).subscribe({
        next: (res: any) => {
          this.membershipPayments.set(res.membership_payments || []);
          this.paidMemberships.set(res.paid_memberships || []);
          this.paidLicense.set(res.paid_license);
          this.years.set(res.years || []);
          this.selectedYear.set(res.year);
          this.isPaymentsVisible.set(true);
        },
        error: (err: any) => {
          const msg = err?.error?.message || 'Error fetching payments';
          this.toastService.presentToast(this.translate.instant(msg));
        }
      });
    }
  }

  /** Toggles payment status for a specific month */
  changeStatus(month: string, status: any) {
    this.membershipsService.changeStatus({
      month,
      status,
      year: this.selectedYear(),
      member_id: this.memberId()
    }).subscribe({
      next: (data) => {
        this.paidMemberships.set(data.paid_memberships);
        this.paidLicense.set(data.paid_license);
      }
    });
  }

  /** Navigates to the payment creation page */
  addPayment() {
    if (this.memberId()) {
      this.router.navigate(['./membership-payment', this.memberId(), 'create']);
    }
  }
}