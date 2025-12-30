import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { GroupMemberService } from 'src/app/core/services/group-member.service';
import { TeamMemberServiceService } from 'src/app/core/services/team-member-service.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-member-change-groups',
  templateUrl: './member-change-groups.page.html',
  styleUrls: ['./member-change-groups.page.scss'],
  standalone: false,
})
export class MemberChangeGroupsPage implements OnInit {
  // --- Services Injected ---
  private activatedRoute = inject(ActivatedRoute);
  private groupMemberService = inject(GroupMemberService);
  private teamMemberService = inject(TeamMemberServiceService);
  private navCtrl = inject(NavController);
  private translate = inject(TranslateService);
  private toastService = inject(ToastService);
  private storage = inject(StorageService);

  // --- Signals & State ---
  public groups: WritableSignal<any[]> = signal([]);
  public selectedGroups: WritableSignal<any[]> = signal([]);
  public memberId: WritableSignal<string | null> = signal(null);

  // UI Flags
  public isLoading: WritableSignal<boolean> = signal(true);
  public isSubmitting: WritableSignal<boolean> = signal(false);

  // Computed Validation (Auto-updates based on signal changes)
  public isValid = computed(() => this.selectedGroups().length > 0);

  constructor() {}

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.isLoading.set(true);
    this.isSubmitting.set(false);

    this.activatedRoute.params.subscribe(params => {
      const id = params['member'] ?? null;
      this.memberId.set(id);
      this.loadData(id);
    });
  }

  /**
   * Loads initial group data for the member
   */
  private loadData(id: string): void {
    if (!id) return;

    this.teamMemberService.index({ id }).subscribe({
      next: (data) => {
        this.groups.set(data.team_groups || []);
        this.selectedGroups.set(data.selected_groups || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  /**
   * Saves updated group selections and refreshes local member cache
   */
  async save(): Promise<void> {
    if (!this.isValid()) {
      this.toastService.presentToast(this.translate.instant('form_not_filled_right'));
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      member_id: this.memberId(),
      groups_id: this.selectedGroups()
    };

    this.teamMemberService.store(payload).subscribe({
      next: async () => {
        const currentGroup = await this.storage.get(AuthConstants.GROUP);
        
        // Refresh the member cache for the current group
        this.groupMemberService.index({ group_id: currentGroup.id }).subscribe({
          next: async (res: any) => {
            await this.storage.set(AuthConstants.GROUP_MEMBERS, res.team_members);
            this.isSubmitting.set(false);
            this.navCtrl.pop();
          }
        });
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.toastService.presentToast(err.error?.message || 'Error updating groups');
      }
    });
  }
}