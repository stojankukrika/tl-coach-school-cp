import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { MembershipsService } from 'src/app/core/services/memberships.service';
import { ToastService } from 'src/app/core/services/toast.service';

// Define explicit type for the Payment form data
interface PaymentData {
  member_id: string;
  date: string;
  date_expired: string | null;
  amount: number;
  name: string;
  payment_slip_number: string;
  payer_name: string;
  payment_method: string;
}

@Component({
  selector: 'app-form-membership-payment',
  templateUrl: './form-membership-payment.page.html',
  styleUrls: ['./form-membership-payment.page.scss'],
  standalone: false
})
export class FormMembershipPaymentPage implements OnInit {

  // --- Dependency Injection using `inject` ---
  private route = inject(ActivatedRoute);
  public toastService = inject(ToastService);
  public translate = inject(TranslateService);
  public membershipsService = inject(MembershipsService);
  private navCtrl = inject(NavController);

  // --- State as Signals ---

  // UI State and Configuration
  readonly maxDate = signal(new Date().toISOString());
  readonly clicked = signal(false); // Loading state for save button
  readonly show = signal(false); // Controls main content visibility
  readonly showEndDate = signal(false);
  readonly showMemberships = signal(false); // Whether to show membership-specific controls

  // Data Signals
  readonly memberId = signal<string | null>(null);
  readonly payment = signal<Partial<PaymentData>>({});
  readonly years = signal<any[]>([]);
  readonly months = signal<string[]>(['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']);
  readonly year = signal<string>('');
  readonly month = signal<string>(''); // Used for month selection in the form

  // Configuration Signals
  readonly paymentMethods = signal<string[]>(['cash', 'card', 'slip', 'internet', 'other']);
  readonly permissions = signal<string[]>([]);
  readonly teamAppSettings = signal<any>(null);


  constructor() {
    // Initializations are now handled via signal defaults or the load logic
  }

  ngOnInit(): void {
    // Get memberId from route params
    this.route.params.subscribe(params => {
      this.memberId.set(params['member'] ?? null);
      if (this.memberId()) {
        this.ionViewWillEnter();
      }
    });
  }

  // NOTE: ionViewWillEnter logic moved here, triggered after memberId is set
  ionViewWillEnter() {
    // 1. Get Permissions and App Settings
    const permissionsString = localStorage.getItem(AuthConstants.PERMISSIONS) as string;
    const permissions = permissionsString ? JSON.parse(permissionsString) : [];
    this.permissions.set(permissions);

    const role = localStorage.getItem(AuthConstants.ROLE);
    const canManageMemberships = permissions.includes('paid_memberships') && 
                                (role === 'management' || role === 'top_coach');
    this.showMemberships.set(canManageMemberships);

    const appSettingsString = localStorage.getItem(AuthConstants.APPSETTINGS) as string;
    const appSettings = appSettingsString ? JSON.parse(appSettingsString) : {};
    this.teamAppSettings.set(appSettings);
    
    // 2. Fetch Membership Amount
    this.membershipsService.membershipAmount({'member_id': this.memberId()}).subscribe((res: any) => {
      const defaultPaymentMethod = this.teamAppSettings()?.default_payment_method ?? 'cash';
      
      // Initialize payment signal
      this.payment.set({
        member_id: this.memberId()!,
        date: new Date().toISOString(),
        date_expired: null,
        amount: res.team_membership_amount ?? 0,
        name: '',
        payment_slip_number: '',
        payer_name: '',
        payment_method: defaultPaymentMethod,
      });

      // 3. Fetch Membership Index (if permitted)
      if (this.showMemberships()) {
        this.membershipsService.index({'member_id': this.memberId()}).subscribe({
          next: (indexRes: any) => {
            this.years.set(indexRes.years);
            this.year.set(indexRes.year); // Current year
            this.show.set(true);

            if (indexRes.expired_membership > 0) {
              // Calculate date one month from now
              const nextMonth = new Date();
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              
              // Update payment signal with new expiration date
              this.payment.update(p => ({
                  ...p,
                  date_expired: nextMonth.toISOString()
              }));
              this.showEndDate.set(true);
            }
          },
          error: (data: any) => {
            this.toastService.presentToast(this.translate.instant(data.error.message));
          }
        });
      } else {
        this.show.set(true);
      }
    });
  }

  // --- Signal Helper Methods ---

  /** Updates a single field in the reactive `payment` object signal. */
  setPaymentField(key: keyof PaymentData | string, value: any) {
    this.payment.update((p) => {
      // Handle amount conversion if necessary (input type="number" returns string)
      const finalValue = key === 'amount' ? (value ? parseFloat(value) : 0) : value;
      return { 
        ...(p || {}), 
        [key]: finalValue 
      };
    });
  }

  // --- Computed Validation ---

  readonly isInputValid = computed(() => {
    const p = this.payment();
    // Use optional chaining inside the signal to prevent runtime errors if payment is null/empty
    const paymentMethod = p.payment_method;
    const amount = p.amount;
    
    return (
      !!paymentMethod && paymentMethod.length > 0 &&
      !!amount && amount > 0
    );
  });
  // --- Action Method ---
  save() {
    if (this.isInputValid()) {
      this.clicked.set(true);
      let payload = this.payment();
      const currentMonth = this.month();
      const currentYear = this.year();
      // If name is empty and month is selected, generate a default name
      if (payload.name?.length === 0 && currentMonth.length > 0) {
        const generatedName = `${this.translate.instant('membership')} : ${this.translate.instant('month_' + currentMonth)}`;
        this.payment.update(p => ({ ...p, name: generatedName }));
        payload = { ...payload, name: generatedName }; // Use updated payload
      }

      this.membershipsService.create(payload).subscribe({
        next: () => {
          // If month and year are selected, update membership status to paid
          if (currentMonth.length > 0 && currentYear.length > 0) {
            this.membershipsService.changeStatus({
              year: currentYear,
              member_id: this.memberId(),
              status: 'paid',
              month: currentMonth
            }).subscribe(() => {
              // Status updated, continue navigation
              this.clicked.set(false);
              this.navCtrl.pop();
            });
          } else {
            // No status change needed, just navigate back
            this.clicked.set(false);
            this.navCtrl.pop();
          }
        },
        error: (data: any) => {
          this.clicked.set(false);
          this.toastService.presentToast(data.error.message);
        }
      });
    } else {
      this.clicked.set(false);
      this.toastService.presentToast(this.translate.instant('form_not_filled_right'));
    }
  }

  protected readonly TranslateService = TranslateService;
}