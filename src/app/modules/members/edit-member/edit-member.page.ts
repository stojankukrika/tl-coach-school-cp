import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { GroupMemberService } from 'src/app/core/services/group-member.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-edit-member',
  templateUrl: './edit-member.page.html',
  styleUrls: ['./edit-member.page.scss'],
  standalone: false
})
export class EditMemberPage implements OnInit {
  // --- Dependency Injection ---
  private activatedRoute = inject(ActivatedRoute);
  private groupMemberService = inject(GroupMemberService);
  private toastService = inject(ToastService);
  private navCtrl = inject(NavController);
  public translate = inject(TranslateService);

  // --- State Signals ---
  show = signal(false);
  clicked = signal(false);
  member = signal<any>({});
  groups = signal<any[]>([]);
  teamMemberships = signal<any[]>([]);
  customFields = signal<any[]>([]);

  // App Settings Signals
  showMedicalExamination = signal(false);
  showMembershipsAndMedical = signal(false);
  maxDate = signal(new Date().toISOString());

  // --- Computed Validations ---
  isFormValid = computed(() => {
    const m = this.member();
    return m?.first_name?.length > 0 &&
           m?.last_name?.length > 0 &&
           m?.group_ids?.length > 0;
  });

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.show.set(false);
    this.loadData();
  }

  private loadData() {
    const appSettings = JSON.parse(localStorage.getItem(AuthConstants.APPSETTINGS) || '{}');
    const role = localStorage.getItem(AuthConstants.ROLE);

    this.showMedicalExamination.set(appSettings.medical_examination_dates_coach === 'show');
    this.showMembershipsAndMedical.set(role === 'management' || role === 'top_coach');

    const id = this.activatedRoute.snapshot.params['id'];

    // Nested subscriptions refactored to handle data initialization
    this.groupMemberService.customFields([]).subscribe((fieldData) => {
      const phone_prefix = fieldData.phone_prefix;

      this.groupMemberService.allGroups([]).subscribe(g => this.groups.set(g.team_groups));
      this.groupMemberService.teamMemberships([]).subscribe(m => this.teamMemberships.set(m.team_memberships));

      this.groupMemberService.show({ id }).subscribe(data => {
        const m = data.team_member;
        m.birth_date = m.birth_date_formated;
        m.team_membership_id = (m.team_membership_id ?? '').toString();
        m.phone_prefix = phone_prefix;
        m.group_ids = data.team_groups.map((g: any) => g.team_group_id);

        this.member.set(m);
        this.customFields.set(data.custom_fields.map((f: any) => ({
          value: f.custom_value,
          label: f.label,
          id: f.id
        })));

        this.show.set(true);
      });
    });
  }

  updateMemberField(key: string, value: any) {
    this.member.update(m => ({ ...m, [key]: value }));
  }

  save() {
    if (!this.isFormValid()) {
      this.toastService.presentToast(this.translate.instant('form_not_filled_right'));
      return;
    }

    this.clicked.set(true);
    const payload = { ...this.member(), custom_fields: this.customFields() };

    this.groupMemberService.update(payload).subscribe({
      next: () => {
        const group = JSON.parse(localStorage.getItem(AuthConstants.GROUP) || '{}');
        this.groupMemberService.index({ group_id: group.id }).subscribe((res: any) => {
          localStorage.setItem(AuthConstants.GROUP_MEMBERS, JSON.stringify(res.team_members));
          this.clicked.set(false);
          this.navCtrl.pop();
        });
      },
      error: (err) => {
        this.clicked.set(false);
        this.toastService.presentToast(err.error.message);
      }
    });
  }
}
