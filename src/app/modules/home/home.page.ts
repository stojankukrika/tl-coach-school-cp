import { Component, Inject, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

// Capacitor Plugins
import { Share } from '@capacitor/share';

// Services & Config
import { APP_CONFIG, AppConfig } from 'src/app/core/config/app.config';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { AuthService } from 'src/app/core/services/auth.service';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { GroupMemberService } from 'src/app/core/services/group-member.service';
import { FcmService } from 'src/app/core/services/fcm.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  // --- Services Injected ---
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private toastService = inject(ToastService);
  private alertController = inject(AlertController);
  private translate = inject(TranslateService);
  private groupMemberService = inject(GroupMemberService);
  private fcm = inject(FcmService);
  private storage = inject(StorageService);

  // --- Signals & State ---
  public viewType = signal<string>('grid');
  public team = signal<any>(null);
  public teamsCount = signal<number>(0);
  public unreadNotifications = signal<number>(0);
  public teamGroups = signal<any[]>([]);
  public dynamicStyles = signal<{ [key: string]: string }>({});

  // Feature Flags (Signals)
  public showMemberships = signal<boolean>(false);
  public showPayments = signal<boolean>(false);
  public showEvents = signal<boolean>(false);
  public showCreateMember = signal<boolean>(false);

  constructor(@Inject(APP_CONFIG) public config: AppConfig) {}

  async ngOnInit() {
    await this.parseData();
  }

  async ionViewWillEnter() {
    this.fcm.initPush();
    await this.loadData();
  }

  /**
   * Universal Navigation Function
   */
  navigateTo(path: string, params: any[] = []): void {
    if (params.length > 0) {
      this.router.navigate(['./' + path, ...params]);
    } else {
      this.router.navigate(['./' + path]);
    }
  }

  private async parseData(): Promise<void> {
    const userData = await this.storage.get(AuthConstants.AUTH);
    if (userData && userData.teams) {
      const currentTeam = userData.teams.find((t: any) => t.id === userData.current_team_id);
      this.team.set(currentTeam);
      this.teamsCount.set(userData.teams.length);
    }
  }

  async loadData() {
    this.dashboardService.index().subscribe({
      next: async (res: any) => {
        // Reset flags
        this.showPayments.set(false);
        this.showMemberships.set(false);
        this.showEvents.set(false);
        this.showCreateMember.set(false);

        this.unreadNotifications.set(res.unread_notifications);
        this.teamGroups.set(res.groups || []);

        // Persist session data to Capacitor Storage
        await this.storage.set(AuthConstants.AUTH, res.user);
        await this.storage.set(AuthConstants.PERMISSIONS, res.permissions);
        await this.storage.set(AuthConstants.APPSETTINGS, res.team_app_settings);
        await this.storage.set(AuthConstants.ROLE, res.role);

        this.applyBranding(res.branding_color, res.branding_logo, res.team_app_settings);
        this.checkPermissions(res.permissions, res.role);
        
        // Check for App Updates
        if (this.isNewerVersion(environment.version, res.android_school_version)) {
          this.showUpdateAlert();
        }
      },
      error: async (err) => this.handleError(err)
    });
  }

  private applyBranding(color: string, logo: string, settings: any) {
    const primaryColor = color || '#364F6B';
    document.documentElement.style.setProperty('--ion-color-primary', primaryColor);
    document.documentElement.style.setProperty('--primary', primaryColor);

    if (settings?.show_logo_on_start_coach === 'show' && logo) {
      this.dynamicStyles.set({
        'background-image': `url('${logo}')`,
        'background-size': 'cover',
        'background-position': 'center'
      });
    } else {
      this.dynamicStyles.set({});
    }
  }

  private checkPermissions(permissions: string[], role: string) {
    const isPowerUser = role === 'management' || role === 'top_coach';
    
    if (permissions?.includes('paid_memberships') && isPowerUser) {
      this.showMemberships.set(true);
    } else if (permissions?.includes('team_memberships') && isPowerUser) {
      this.showPayments.set(true);
    }

    this.showEvents.set(permissions?.includes('events') || false);
    this.showCreateMember.set(isPowerUser);
  }

  /**
   * Modern Capacitor Share implementation
   */
  async shareApp() {
    try {
      await Share.share({
        title: this.translate.instant('app_name'),
        text: this.translate.instant('share_app_info'),
        url: 'https://play.google.com/store/apps/details?id=com.sport.trenirajlako',
        dialogTitle: this.translate.instant('share_with_friends'),
      });
    } catch (error) {
      // Fallback to clipboard if share fails (e.g., on some desktop browsers)
      await navigator.clipboard.writeText('https://play.google.com/store/apps/details?id=com.sport.trenirajlako');
      this.toastService.presentToast(this.translate.instant('link_copied'));
    }
  }

  async group(group: any) {
    console.log(group);
    
    await this.storage.set(AuthConstants.GROUP, group);
    this.groupMemberService.all({ group_id: group.id }).subscribe(async (res: any) => {
      await this.storage.set(AuthConstants.GROUP_MEMBERS, res.team_members);
      this.navigateTo('table-presence', [group.id]);
    });
  }

  logout() {
    this.authService.logout();
  }

  private isNewerVersion(oldVer: string, newVer: string): boolean {
    const oldParts = oldVer.split('.').map(Number);
    const newParts = newVer.split('.').map(Number);
    for (let i = 0; i < newParts.length; i++) {
      if (newParts[i] > (oldParts[i] || 0)) return true;
      if (newParts[i] < (oldParts[i] || 0)) return false;
    }
    return false;
  }

  private async handleError(data: any) {
    if (data.error?.message === 'Unauthenticated.' || data.error?.errors?.[0] === 'subscription_expired') {
      await this.storage.remove(AuthConstants.TOKEN);
      await this.storage.remove(AuthConstants.AUTH);
      this.navCtrl.navigateRoot(['./sign-in']);
    }
    this.toastService.presentToast(data.error?.errors?.[0] || 'Error loading dashboard');
  }

  // --- Helper Navigation Wrappers ---
  openPlayStore() { window.open('https://play.google.com/store/apps/details?id=com.sport.trenirajlako', '_system'); }
  openPlayStoreRate() { window.open('https://play.google.com/store/apps/details?id=com.sport.trenirajlako&reviewId=0', '_system'); }

  private async showUpdateAlert() {
    const alert = await this.alertController.create({
      header: this.translate.instant('new_version'),
      message: this.translate.instant('new_version_info'),
      buttons: [{ text: this.translate.instant('playstore'), handler: () => this.openPlayStore() }]
    });
    await alert.present();
  }
}