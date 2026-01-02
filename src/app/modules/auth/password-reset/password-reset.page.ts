import { Component, inject, signal, WritableSignal } from '@angular/core';
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
export class PasswordResetPage{

  public authService = inject(AuthService);
  private navCtrl = inject(NavController);
  public toastService = inject(ToastService);
  public translate = inject(TranslateService);

  // UI state flag (to disable button during API call)
  public clicked: WritableSignal<boolean> = signal(false);

  // Form data state
  public data: WritableSignal<ResetData> = signal({
    email: null
  });

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
          this.navCtrl.navigateRoot(['./sign-in']);
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
      this.toastService.presentToast(this.translate.instant('form_not_filled_right'));
    }
  }
  back() {
    this.navCtrl.navigateBack(['sign-in']);
  }
}
