import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { MembershipsService } from 'src/app/core/services/memberships.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-form-membership-payment',
  templateUrl: './form-membership-payment.page.html',
  styleUrls: ['./form-membership-payment.page.scss'],
  standalone: false,
})
export class FormMembershipPaymentPage implements OnInit {
  // --- Services ---
  private route = inject(ActivatedRoute);
  private membershipsService = inject(MembershipsService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private navCtrl = inject(NavController);

  // --- Signals & State ---
  public payment: WritableSignal<any> = signal({
    member_id: '',
    date: new Date().toISOString(),
    amount: 0,
    name: '',
    payment_slip_number: '',
    payer_name: '',
    payment_method: 'cash',
  });

  public years = signal<any[]>([]);
  public selectedYear = signal<string>('');
  public selectedMonth = signal<string>('');
  
  // Constants
  public paymentMethods = signal(['cash', 'card', 'slip', 'internet', 'other']);
  public months = signal(['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']);
  public maxDate = signal(new Date().toISOString());

  // UI Flags
  public isLoading = signal(true);
  public isSubmitting = signal(false);

  // Computed Validation
  public isValid = computed(() => {
    const p = this.payment();
    return p.payment_method?.length > 0 && p.amount > 0;
  });

  constructor() {}

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.isLoading.set(true);
    
    this.route.params.subscribe(params => {
      const memberId = params['member'] ?? null;
      this.loadInitialData(memberId);
    });
  }

  private loadInitialData(memberId: string) {
    // 1. Fetch default amount
    this.membershipsService.membershipAmount({ member_id: memberId }).subscribe({
      next: (res: any) => {
        this.payment.update(p => ({
          ...p,
          member_id: memberId,
          amount: res.team_membership_amount ?? 0
        }));

        // 2. Fetch available years
        this.membershipsService.index({ member_id: memberId }).subscribe({
          next: (membershipRes: any) => {
            this.years.set(membershipRes.years || []);
            this.selectedYear.set(membershipRes.year);
            this.isLoading.set(false);
          },
          error: (err) => this.handleError(err)
        });
      },
      error: (err) => this.handleError(err)
    });
  }

  /** Helper to update specific fields in the payment signal */
  updatePaymentField(field: string, value: any) {
    this.payment.update(p => ({ ...p, [field]: value }));
  }

  async save() {
    if (!this.isValid()) {
      this.toastService.presentToast(this.translate.instant('form_not_filled_right'));
      return;
    }

    this.isSubmitting.set(true);

    this.membershipsService.create(this.payment()).subscribe({
      next: () => {
        // If year and month are selected, update membership status
        if (this.selectedMonth() && this.selectedYear()) {
          this.membershipsService.changeStatus({
            year: this.selectedYear(),
            member_id: this.payment().member_id,
            status: 'paid',
            month: this.selectedMonth()
          }).subscribe();
        }

        this.isSubmitting.set(false);
        this.navCtrl.pop();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastService.presentToast(err.error?.message || 'Error saving payment');
      }
    });
  }

  private handleError(err: any) {
    this.isLoading.set(false);
    this.toastService.presentToast(this.translate.instant(err.error?.message || 'Error'));
  }
}