import { Component, Inject, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { NavController } from '@ionic/angular';
import { APP_CONFIG, AppConfig } from 'src/app/core/config/app.config';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-change-team',
  templateUrl: './change-team.page.html',
  styleUrls: ['./change-team.page.scss'],
  standalone: false,
})
export class ChangeTeamPage implements OnInit {
  // --- Services Injected via inject() ---
  private navCtrl = inject(NavController);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private storage = inject(StorageService);

  // --- Signals & State ---
  public teams: WritableSignal<Array<{ id: string, name: string }>> = signal([]);
  public selectedTeamId: WritableSignal<string | null> = signal(null);

  constructor(@Inject(APP_CONFIG) private config: AppConfig) {}

  async ngOnInit() {
    await this.loadUserData();
  }

  /** Fetch user data from Capacitor Storage */
  private async loadUserData(): Promise<void> {
    const authData = await this.storage.get(AuthConstants.AUTH);
    if (authData) {
      const user = typeof authData === 'string' ? JSON.parse(authData) : authData;
      this.teams.set(user.teams || []);
      this.selectedTeamId.set(user.current_team_id);
    }
  }

  /** Update signal on selection */
  onTeamClick(team: { id: string, name: string }): void {
    this.selectedTeamId.set(team.id);
  }

  /** Update team via API and refresh local Storage */
  teamConfirm(): void {
    const teamId = this.selectedTeamId();
    if (!teamId) return;

    this.authService.updateTeam({ 'team_id': teamId }).subscribe({
      next: async (res) => {
        // Update Capacitor Preferences with new user object and role
        await this.storage.set(AuthConstants.AUTH, res.user);
        await this.storage.set(AuthConstants.ROLE, res.role);
        
        this.navCtrl.pop();
      },
      error: (err: any) => {
        const message = err?.error?.message || 'Error updating team';
        this.toastService.presentToast(message);
      }
    });
  }
}