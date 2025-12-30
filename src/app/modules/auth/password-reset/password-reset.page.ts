import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

// Define a type for the data structure
interface ResetData {
  email: string | null;
}

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
  standalone:false
})
export class PasswordResetPage implements OnInit {

  // --- Services Injected via Angular's 'inject' function ---
  public authService = inject(AuthService);
  private navCtrl = inject(NavController);
  public toastService = inject(ToastService);
  public translate = inject(TranslateService);

  // --- Signals for state management ---

  // UI state flag (to disable button during API call)
  public clicked: WritableSignal<boolean> = signal(false);

  // Form data state
  public data: WritableSignal<ResetData> = signal({
    email: null
  });

  constructor() {
    // Initial signal values are set above
  }

  ngOnInit(): void {
    // Since the signal is initialized above, we don't need logic here unless 
    // we want to ensure data.email is an empty string instead of null for forms.
    // this.data.set({ email: '' }); 
  }

  // Validation logic
  validateInputs(): boolean {
    const currentData = this.data();
    const email = currentData.email;

    // Checks if email is not null and has a length greater than 0
    return !!email && email.length > 0;
  }

  // Password reset execution logic
  resetPassword() {
    if (this.validateInputs()) {
      this.clicked.set(true); // Start loading state

      this.authService.resetPassword(this.data()).subscribe(
        // Success handler
        () => {
          // Navigate to sign-in on successful reset
          this.navCtrl.navigateRoot(['./sign-in']);
          // Optional: Present success toast here if the server response doesn't handle it
        },
        // Error handler
        (data: any) => {
          this.clicked.set(false); // Stop loading state

          // Handle error message translation/display
          if (data.error && data.error.error) {
            this.toastService.presentToast(this.translate.instant(data.error.error));
          } else if (data.error && data.error.message) {
            this.toastService.presentToast(data.error.message);
          } else {
            // Generic fallback message
            this.toastService.presentToast(this.translate.instant('reset_password_error'));
          }
        });
    } else {
      // Optional: Present a validation toast if needed
      // this.toastService.presentToast(this.translate.instant('please_enter_email'));
    }
  }

  // Navigation back to sign-in page
  back() {
    this.navCtrl.navigateBack(['sign-in']);
  }
}