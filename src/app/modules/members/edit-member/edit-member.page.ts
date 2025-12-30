import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { GroupMemberService } from 'src/app/core/services/group-member.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-edit-member',
  templateUrl: './edit-member.page.html',
  styleUrls: ['./edit-member.page.scss'],
  standalone: false,
})
export class EditMemberPage implements OnInit {
  // --- Services Injected ---
  private activatedRoute = inject(ActivatedRoute);
  private groupMemberService = inject(GroupMemberService);
  private translate = inject(TranslateService);
  private toastService = inject(ToastService);
  private navCtrl = inject(NavController);
  private storage = inject(StorageService);

  // --- Signals & State ---
  public member: WritableSignal<any> = signal(null);
  public groups: WritableSignal<any[]> = signal([]);
  public customFields: WritableSignal<any[]> = signal([]);
  public maxDate = signal(new Date().toISOString());
  
  // UI Flags
  public isSubmitting: WritableSignal<boolean> = signal(false);
  public isLoading: WritableSignal<boolean> = signal(true);

  // Computed Validation
  public isValid = computed(() => {
    const m = this.member();
    if (!m) return false;
    return m.first_name?.trim().length > 0 && 
           m.last_name?.trim().length > 0 && 
           m.group_ids?.length > 0;
  });

  constructor() {}

  ngOnInit(): void {}

  async ionViewWillEnter() {
    this.isLoading.set(true);
    
    this.activatedRoute.params.subscribe(params => {
      const id = params['id'] ?? null;
      this.loadInitialData(id);
    });
  }

  private loadInitialData(memberId: string) {
    // 1. Fetch phone prefixes and metadata
    this.groupMemberService.customFields([]).subscribe({
      next: (meta) => {
        // 2. Fetch all available groups for selection
        this.groupMemberService.allGroups([]).subscribe({
          next: (groupData) => {
            this.groups.set(groupData.team_groups);
            
            // 3. Fetch specific member details
            this.groupMemberService.show({ id: memberId }).subscribe({
              next: (data) => {
                const memberData = data.team_member;
                
                // Format data for Signals
                memberData.birth_date = memberData.birth_date_formated;
                memberData.phone_prefix = meta.phone_prefix;
                memberData.group_ids = data.team_groups.map((g: any) => g.team_group_id);
                
                this.member.set(memberData);
                this.customFields.set(data.custom_fields.map((cf: any) => ({
                  value: cf.custom_value,
                  label: cf.label,
                  id: cf.id
                })));
                
                this.isLoading.set(false);
              },
              error: () => this.isLoading.set(false)
            });
          }
        });
      }
    });
  }

updateMemberField(field: string, value: any) {
  this.member.update(m => {
    if (!m) return m; // Stay null if not initialized
    return { ...m, [field]: value };
  });
}

  async save() {
    if (!this.isValid()) {
      this.toastService.presentToast(this.translate.instant('form_not_filled_right'));
      return;
    }

    this.isSubmitting.set(true);
    const payload = { ...this.member(), custom_fields: this.customFields() };

    this.groupMemberService.update(payload).subscribe({
      next: async () => {
        const currentGroup = await this.storage.get(AuthConstants.GROUP);
        
        // Refresh cache for the group member list
        this.groupMemberService.index({ group_id: currentGroup.id }).subscribe({
          next: async (res: any) => {
            await this.storage.set(AuthConstants.GROUP_MEMBERS, res.team_members);
            this.isSubmitting.set(false);
            this.navCtrl.pop();
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastService.presentToast(err.error?.message || 'Error updating member');
      }
    });
  }
}