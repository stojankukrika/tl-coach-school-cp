import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: false
})
export class EditProfilePage implements OnInit {

  // --- Dependency Injection using `inject` ---
  public authService = inject(AuthService);
  public translate = inject(TranslateService);
  private navCtrl = inject(NavController);
  public toastService = inject(ToastService);

  // --- State as Writable Signals ---
  showDetails: WritableSignal<boolean> = signal(false);
  user: WritableSignal<any | null> = signal(null);
  clicked: WritableSignal<boolean> = signal(false);

  // --- Computed Signals ---
  
  // Determines if all required input fields have been filled
  isInputValid = computed(() => {
    const u = this.user();
    if (!u) return false;

    const email = u.email;
    const first_name = u.first_name;
    const last_name = u.last_name;

    return (
      !!email && email.trim().length > 0 &&
      !!first_name && first_name.trim().length > 0 &&
      !!last_name && last_name.trim().length > 0
    );
  });

  // --- Constructor ---
  constructor() {
    // Dependencies are handled by inject()
  }

  // --- Lifecycle Hooks ---
  ngOnInit() {
    // Load user data from local storage
    const userString = localStorage.getItem(AuthConstants.AUTH);
    if (userString) {
      this.user.set(JSON.parse(userString) as any);
    }
    this.showDetails.set(true);
  }

  // --- Public Methods ---

  /**
   * Helper function for manual two-way binding with signals.
   * Updates a specific field in the user signal.
   * @param key The key of the UserData property to update.
   * @param value The new value.
   */
  updateUserField<K extends keyof any>(key: K, value: any[K]): void {
    this.user.update(current => ({
      ...current!,
      [key]: value
    }));
  }

  save() {
    if (this.isInputValid()) {
      this.clicked.set(true);
      
      const payload = this.user();

      // Ensure payload is not null before sending
      if (!payload) {
         this.clicked.set(false);
         this.toastService.presentToast(this.translate.instant('error_loading_user'));
         return;
      }
      
      this.authService.profile(payload).subscribe({
        next: (res: any) => {
          // Update local storage with new user data
          localStorage.setItem(AuthConstants.AUTH, JSON.stringify(res.user));
          this.clicked.set(false);
          this.navCtrl.pop(); // Navigate back
        },
        error: (data: any) => {
          this.clicked.set(false);
          // Assuming data.error.message contains the error text
          this.toastService.presentToast(this.translate.instant(data?.error?.message || 'save_error'));
        }
      });
    } else {
      this.clicked.set(false);
      this.toastService.presentToast(this.translate.instant('form_not_filled_right'));
    }
  }
}