import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { GroupMemberService } from 'src/app/core/services/group-member.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.page.html',
  styleUrls: ['./add-member.page.scss'],
  standalone: false,
})
export class AddMemberPage implements OnInit {
  // --- Services Injected ---
  private groupMemberService = inject(GroupMemberService);
  private translate = inject(TranslateService);
  private toastService = inject(ToastService);
  private navCtrl = inject(NavController);
  private storage = inject(StorageService);

  // --- Signals & State ---
  public member: WritableSignal<any> = signal({
    first_name: '',
    last_name: '',
    birth_date: new Date().toISOString(),
    urgent_kinship: '',
    urgent_contact: '',
    urgent_phone: '',
    phone_prefix: '',
    group_ids: [],
  });

  public groups: WritableSignal<any[]> = signal([]);
  public customFields: WritableSignal<any[]> = signal([]);
  public maxDate = signal(new Date().toISOString());
  
  // UI Flags
  public isSubmitting: WritableSignal<boolean> = signal(false);
  public isLoading: WritableSignal<boolean> = signal(true);

  // Computed Validation (replaces validateInputs)
  public isValid = computed(() => {
    const m = this.member();
    return m.first_name?.trim().length > 0 && 
           m.last_name?.trim().length > 0 && 
           m.group_ids?.length > 0;
  });

  constructor() {}

  ngOnInit(): void {}

  async ionViewWillEnter() {
    this.isLoading.set(true);
    
    // Using simple subscription flow to fetch initial data
    this.groupMemberService.customFields([]).subscribe({
      next: (data) => {
        this.customFields.set(data.custom_fields);
        
        // Update member signal with the default prefix
        this.member.update(m => ({ ...m, phone_prefix: data.phone_prefix }));

        this.groupMemberService.allGroups([]).subscribe({
          next: (groupData) => {
            this.groups.set(groupData.team_groups);
            this.isLoading.set(false);
          }
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  /** Unified Update Method for Member Signal */
  updateMemberField(field: string, value: any) {
    this.member.update(m => ({ ...m, [field]: value }));
  }

  async save() {
    if (!this.isValid()) {
      this.toastService.presentToast(this.translate.instant('form_not_filled_right'));
      return;
    }

    this.isSubmitting.set(true);
    const payload = { ...this.member(), custom_fields: this.customFields() };

    this.groupMemberService.create(payload).subscribe({
      next: () => {
        // Refresh local member cache after adding a new one
        this.groupMemberService.index({ group_id: 0 }).subscribe({
          next: async (res: any) => {
            await this.storage.remove(AuthConstants.GROUP_MEMBERS);
            await this.storage.set(AuthConstants.GROUP_MEMBERS, res.team_members);
            
            this.isSubmitting.set(false);
            this.navCtrl.pop();
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastService.presentToast(err.error?.message || 'Error saving member');
      }
    });
  }
}