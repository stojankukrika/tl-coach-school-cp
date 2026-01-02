import { Component, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { GroupMemberService } from 'src/app/core/services/group-member.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';



@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.page.html',
  styleUrls: ['./add-member.page.scss'],
standalone:false
})
export class AddMemberPage implements OnInit {

  // --- Dependency Injection using `inject` ---
  private groupMemberService = inject(GroupMemberService);
  public translate = inject(TranslateService);
  private toastService = inject(ToastService);
  private navCtrl = inject(NavController);

  // --- State as Signals ---

  /** Member form data: Initialized as a Partial MemberData object */
  readonly member = signal<any>({});

  /** Data for dropdowns/config */
  readonly groups = signal<any[]>([]);
  readonly customFields = signal<any[]>([]);
  readonly team_memberships = signal<any[]>([]);

  /** Configuration and UI state */
  readonly maxDate = signal(new Date().toISOString());
  readonly clicked = signal(false); // Used for saving/loading state
  readonly show = signal(false); // Controls main UI visibility

  // App settings and role-based visibility
  readonly teamAppSettings = signal<any>(null);
  readonly showMedicalExamination = signal(false);
  readonly showMembershipsAndMedical = signal(false);
  readonly phone_prefix = signal<string>('');


  constructor() { }

  ngOnInit(): void { }

  ionViewWillEnter() {
    this.loadInitialData();
  }

  loadInitialData() {
    // ... (App settings and role-based visibility logic remains the same)
    const appSettingsString = localStorage.getItem(AuthConstants.APPSETTINGS) as string;
    const appSettings = appSettingsString ? JSON.parse(appSettingsString) : {};
    this.teamAppSettings.set(appSettings);

    this.showMedicalExamination.set(
      'show' === appSettings.medical_examination_dates_coach
    );

    const userRole = localStorage.getItem(AuthConstants.ROLE);
    this.showMembershipsAndMedical.set(userRole === 'management' || userRole === 'top_coach');
    // ...

    // Fetch Custom Fields and Groups/Memberships
    this.groupMemberService.customFields([]).subscribe((data: any) => {
      this.customFields.set(data.custom_fields);
      this.phone_prefix.set(data.phone_prefix);

      // Initialize member data with correct default types
      this.member.set({
        first_name: '',
        last_name: '',
        birth_date: null,
        urgent_kinship: '',
        urgent_contact: '',
        urgent_phone: '',
        phone_prefix: data.phone_prefix,
        birth_date_show: false,
        enrollment_date_show: false,
        last_medical_examination_show: false,
        next_medical_examination_show: false,
        group_ids: [],
      });

      this.groupMemberService.allGroups([]).subscribe((groupData: any) => {
        this.groups.set(groupData.team_groups);

        this.groupMemberService.teamMemberships([]).subscribe((membershipData: any) => {
          this.team_memberships.set(membershipData.team_memberships);
          this.show.set(true);
        });
      });
    });
  }
  /** * Updates a single key/value pair in the reactive `member` object signal.
   * This is crucial for two-way binding with signals in Ionic.
   */
  setMember(key: keyof any | string, value: any) {
    this.member.update((m) => {
      // Use the spread operator to create a new object instance,
      // ensuring the signal change detection fires.
      return {
        ...(m || {}),
        [key]: value
      };
    });
  }

  /**
   * Updates the value of a specific custom field within the `customFields` array signal.
   */
  setCustomField(fieldId: number, value: any) {
    this.customFields.update((fields) => {
      return fields.map((f) =>
        f.id === fieldId ? { ...f, value: value } : f
      );
    });
  }

  validateInputs(): boolean {
    const currentMember = this.member();
    const firstName = currentMember.first_name || '';
    const lastName = currentMember.last_name || '';
    const groupIds = currentMember.group_ids || [];

    // Check if the required fields have non-empty/non-zero values
    return (
      firstName.length > 0 &&
      lastName.length > 0 &&
      groupIds.length > 0
    );
  }

  changeGroup() {
    // Logic for group change if any (remains the same)
  }

  save() {
    if (this.validateInputs()) {
      this.clicked.set(true);

      // Create the final payload object with the correct structure and type
      const memberData = {
        ...this.member(),
        custom_fields: this.customFields()
      };
      this.groupMemberService.create(memberData).subscribe({
        next: () => {
          this.groupMemberService.index({group_id: 0}).subscribe((res: any) => {
            localStorage.setItem(AuthConstants.GROUP_MEMBERS, JSON.stringify(res.team_members));
            this.clicked.set(false);
            this.navCtrl.pop();
          });
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

  public resetBirthDate() {
    this.member.set({birth_date: null});
  }

  public resetEnrollmentDate() {
    this.member.set({enrollment_date: null});
  }

  public resetLastMedicalExamination() {
    this.member.set({last_medical_examination: null});
  }

  public resetNextMedicalExamination() {
    this.member.set({next_medical_examination_show: null});
  }
}
