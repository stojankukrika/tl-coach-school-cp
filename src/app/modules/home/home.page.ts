import {Component, inject, Inject, signal, WritableSignal, computed, Signal} from '@angular/core';
import {Router} from '@angular/router';
import {NavController, AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {APP_CONFIG} from 'src/app/core/config/app.config';
import {AuthConstants} from 'src/app/core/config/auth-constants';
import {AuthService} from 'src/app/core/services/auth.service';
import {DashboardService} from 'src/app/core/services/dashboard.service';
import {FcmService} from 'src/app/core/services/fcm.service';
import {GroupMemberService} from 'src/app/core/services/group-member.service';
import {ToastService} from 'src/app/core/services/toast.service';
import {environment} from 'src/environments/environment';
import {Share} from '@capacitor/share';
import {ConfirmService} from "../../core/services/confirm.service";


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage {
  // --- Services Injected via Angular's 'inject' function ---
  // Using inject() is the preferred modern way over constructor injection
  private router = inject(Router);
  private navCtrl = inject(NavController);
  public authService = inject(AuthService);
  public dashboardService = inject(DashboardService);
  public toastService = inject(ToastService);
  public alertController = inject(AlertController);
  public translate = inject(TranslateService);
  public groupMemberService = inject(GroupMemberService);
  public fcm = inject(FcmService);
  private confirmService = inject(ConfirmService);
  teamLogo = signal<string>('');

  // --- Signals for state management ---

  // State properties
  public viewType: WritableSignal<string | undefined> = signal(undefined);
  public team: WritableSignal<any | undefined> = signal(undefined);
  public teamsCount: WritableSignal<number> = signal(0);
  public teamColor: WritableSignal<string | undefined> = signal(undefined);
  public qrCodeRegisterLink: WritableSignal<string | undefined> = signal(undefined);

  // Data properties
  public dashboardNumbers: WritableSignal<any | undefined> = signal(undefined);
  public teamAppSettings: WritableSignal<any | undefined> = signal(undefined);
  public permissions: WritableSignal<string[] | undefined> = signal(undefined);
  public teamGroups: WritableSignal<any[]> = signal([]);

  // Computed/derived properties for display (based on dashboardNumbers)
  public shopItems: Signal<bigint | number> = computed(() =>
    this.dashboardNumbers()?.shop_products ?? 0
  );
  public pollsItems: Signal<bigint | number> = computed(() =>
    this.dashboardNumbers()?.user_polls ?? 0
  );
  public unreadNotifications: Signal<any> = computed(() =>
    this.dashboardNumbers()?.unread_notifications ?? 0
  );
  public showQrCodeRegister: Signal<boolean> = computed(() =>
    this.qrCodeRegisterLink() != undefined
  );

  // Boolean flags (controlled in loadData)
  public showMemberships: WritableSignal<boolean> = signal(false);
  public showPayments: WritableSignal<boolean> = signal(false);
  public showEvents: WritableSignal<boolean> = signal(false);
  public showCreateMember: WritableSignal<boolean> = signal(false);

  // Dynamic styles property
  public dynamicStyles: WritableSignal<{ background?: string; color?: string; }> = signal({});
  private readonly APP_STORE_LINK = 'https://play.google.com/store/apps/details?id=com.sport.trenirajlako';

  // --- Constructor ---
  // Keep the Inject for AppConfig if it's not a standard Angular service
  constructor(@Inject(APP_CONFIG) public config: any) {
    // Initial signal values are set above, so less is needed in the constructor.
    this.parseData();
    // Setting initial signal values in the constructor is also valid:
    // this.teamGroups.set([]);
  }

  // --- Lifecycle Hooks (Ionic) ---

  ionViewWillEnter() {
    this.fcm.initPush();
    this.loadData();
  }

  // --- Methods ---

  // Updates the viewType signal
  setViewType(vt: string | undefined) {
    this.viewType.set(vt);
  }

  // Parses user data from localStorage and updates signals
  parseData() {
    const userDataString = localStorage.getItem(AuthConstants.AUTH);
    if (userDataString) {
      try {
        const userData: any = JSON.parse(userDataString);

        this.teamsCount.set(userData.teams.length);

        const currentTeam = userData.teams.find((element: any) => element.id === userData.current_team_id);
        if (currentTeam) {
          this.team.set(currentTeam);
        }

      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }

  // Comparison logic remains the same
  isNewerVersion(oldVer: string, newVer: string): boolean {
    const oldParts = oldVer.split('.');
    const newParts = newVer.split('.');
    for (let i = 0; i < newParts.length; i++) {
      const a = ~~newParts[i]; // parse int
      const b = ~~oldParts[i]; // parse int
      if (a > b) {
        return true;
      }
      if (a < b) {
        return false;
      }
    }
    return false;
  }

  // Navigation methods remain the same (use this.router/this.navCtrl)
  async logout() {
    const confirmed = await this.confirmService.confirmLogount();
    if (!confirmed) return;

    await this.authService.logout();

    await this.navCtrl.navigateRoot('/sign-in', {
      animated: false
    });
  }

  openPlayStore() {
    window.open(this.APP_STORE_LINK, '_system');
  }

  openPlayStoreRate() {
    window.open(this.APP_STORE_LINK, '_system');
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  group(group: { id: number }) {
    localStorage.setItem(AuthConstants.GROUP, JSON.stringify(group));
    this.groupMemberService.index({group_id: group.id}).subscribe((res: any) => {
      localStorage.setItem(AuthConstants.GROUP_MEMBERS, JSON.stringify(res.team_members));
      this.router.navigate(['./table-presence', group.id]);
    });
  }

  qrCodeRegister() {
    const link = this.qrCodeRegisterLink();
    if (link) {
      this.router.navigate(['apply-qr', link]);
    } else {
      this.toastService.presentToast('QR code link is not available.');
    }
  }

  // Data fetching and state update logic
  loadData() {
    // Reset boolean flags using .set(false) before fetching data
    this.showPayments.set(false);
    this.showMemberships.set(false);
    this.showEvents.set(false);
    this.showCreateMember.set(false);

    this.dashboardService.index().subscribe(
      (res: any) => {
        // 1. Update Signals with fresh data
        this.dashboardNumbers.set(res);
        this.teamGroups.set(res.groups || []);
        if (res.qr_code_image == 1) {
          this.qrCodeRegisterLink.set(res.ref_link);
        }

        // 2. Update localStorage (still required by other parts of the app)
        localStorage.setItem(AuthConstants.AUTH, JSON.stringify(res.user));
        localStorage.setItem(AuthConstants.PERMISSIONS, JSON.stringify(res.permissions));
        localStorage.setItem(AuthConstants.APPSETTINGS, JSON.stringify(res.team_app_settings));
        localStorage.setItem(AuthConstants.MEASUREMENT_TYPE, res.measurement_type);
        localStorage.setItem(AuthConstants.ROLE, res.role);
        localStorage.setItem(AuthConstants.MEASUREMENT_CATEGORIES, JSON.stringify(res.measurement_categories));

        // 3. Update related Signals from localStorage/response data
        this.teamAppSettings.set(res.team_app_settings);
        this.permissions.set(res.permissions);
        this.teamColor.set(res.branding_color);

        // 4. Handle dynamic styling
        const teamLogo = res.branding_logo;
        const appSettings = this.teamAppSettings();
        const useTeamLogo = appSettings && ('show' === appSettings.show_logo_on_start_coach);
        this.teamLogo.set(teamLogo);
        if (useTeamLogo && teamLogo) {
          this.dynamicStyles.set({
            // '--background': 'none',
            // 'background-size': 'cover',
            // 'background-repeat': 'no-repeat',
            // 'background-position': 'center',
            // 'background-image': `url('${teamLogo}')`,
          });
        } else {
          this.dynamicStyles.set({});
        }

        // 5. Handle dynamic color styling
        const color = this.teamColor();
        if (color) {
          document.documentElement.style.setProperty('--ion-color-primary', color);
          document.documentElement.style.setProperty('--primary', color);
          document.documentElement.style.setProperty('--bg-secondary', color);
          document.documentElement.style.setProperty('--text-black', color);
        } else {
          // Default colors
          document.documentElement.style.setProperty('--ion-color-primary', '#567da1');
          document.documentElement.style.setProperty('--primary', '#567da1');
          document.documentElement.style.setProperty('--bg-secondary', '#567da1');
          document.documentElement.style.setProperty('--text-black', '#567da1');
        }

        // 6. Update permission-based visibility flags
        const currentPermissions = this.permissions() || [];
        const role = localStorage.getItem(AuthConstants.ROLE);
        const isManagementOrTopCoach = (role === 'management' || role === 'top_coach');

        // Logic for showMemberships
        if (currentPermissions.includes('paid_memberships') && isManagementOrTopCoach) {
          this.showMemberships.set(true);
        }

        // Logic for showPayments (only if showMemberships is false)
        if (currentPermissions.includes('team_memberships') && isManagementOrTopCoach && !this.showMemberships()) {
          this.showPayments.set(true);
        }

        // Logic for showEvents
        this.showEvents.set(currentPermissions.includes('events'));

        // Logic for showCreateMember
        this.showCreateMember.set(isManagementOrTopCoach);

        // 7. Re-run parseData in case Auth data changed
        this.parseData();

        // 8. Handle version update alert
        const androidVersion = res.android_school_version;
        if (this.isNewerVersion(environment.version, androidVersion)) {
          this.presentUpdateAlert();
        }

        // 9. Handle rate app alert
        if (res.user.ask_for_rate_app === 1 || res.user.ask_for_rate_app === '1') {
          this.presentRateAlert();
        }
      },
      (data: any) => {
        if (data?.error?.message === 'Unauthenticated.') {
          this.authService.forceLogout();
        }

        if (data?.error?.errors?.[0] === 'subscription_expired') {
          this.toastService.presentToast(
            this.translate.instant('subscription_expired')
          );
          this.authService.forceLogout();
        }

        this.toastService.presentToast(data?.error?.errors?.[0] ?? this.translate.instant('error'));

        setTimeout(() => {
          this.navCtrl.navigateRoot('/sign-in', {
            animated: false
          });
        }, 1000);
      });
  }

  // Helper method for update alert
  private async presentUpdateAlert() {
    const alert = await this.alertController.create({
      backdropDismiss: false,
      header: this.translate.instant('new_version'),
      message: this.translate.instant('new_version_info'),
      buttons: [
        {
          text: '', // Empty text button for dismissal/cancel if needed
          handler: () => this.openPlayStore(),
        },
        {
          text: this.translate.instant('playstore'),
          handler: () => this.openPlayStore(),
        },
      ]
    });
    await alert.present();
  }

  // Helper method for rate alert
  private async presentRateAlert() {
    const alert = await this.alertController.create({
      header: this.translate.instant('ask_for_rate'),
      message: this.translate.instant('ask_for_rate_info'),
      buttons: [
        // The original component commented out the 'later_on' button,
        // but included the `text: ''` button in the previous alert.
        // Re-adding the 'later_on' logic for completeness if ever needed:
        // {
        //   text: this.translate.instant('later_on'),
        //   handler: () => this.dashboardService.cancel().subscribe(() => {}),
        // },
        {
          text: this.translate.instant('rate'),
          handler: () => {
            this.dashboardService.rate().subscribe(() => {
              this.openPlayStoreRate();
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async shareApp() {
    try {
      await Share.share({
        title: 'Treniraj Lako',
        text: this.translate.instant('share_app_info'), // "Here is the app link..."
        url: this.APP_STORE_LINK,
        dialogTitle: this.translate.instant('share_app')
      });
    } catch (e) {
      // Fallback to clipboard
      navigator.clipboard.writeText(this.APP_STORE_LINK);
      this.toastService.presentToast(this.translate.instant('share_app_info'));
    }
  }
}
