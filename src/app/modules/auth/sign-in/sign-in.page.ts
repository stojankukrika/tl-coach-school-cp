import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { AuthService } from 'src/app/core/services/auth.service';
import { MyEvent } from 'src/app/core/services/myevent.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { Constants } from 'src/app/models/contants.models';

// Define a type for the form data for better clarity
interface PostData {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
  standalone: false,
})
export class SignInPage implements OnInit {

  // --- Services Injected via Angular's 'inject' function ---
  private navCtrl = inject(NavController);
  public translate = inject(TranslateService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private myEvent = inject(MyEvent);
  // --- Signals for state management ---

  public showPassword:WritableSignal<boolean> = signal(false);

  // UI state flag (to disable button during API call)
  public clicked: WritableSignal<boolean> = signal(false);

  // Form data state (use Signal for postData)
  public postData: WritableSignal<PostData> = signal({
    email: '',
    password: '',
    rememberMe: false,
  });

  constructor() {
    // Constructor is now mostly empty as signals handle initial state.
  }

  ngOnInit(): void {
    // Initialization logic for the component can go here
  }

  // Ionic lifecycle hook for checking login status
  ionViewWillEnter() {
    this.checkIsUserLogin();
  }

  // Checks local storage for token and redirects or pre-fills login data
  private checkIsUserLogin() {
    const token = localStorage.getItem(AuthConstants.TOKEN);

    if (token && token !== '') {
      // User is logged in, navigate to home
      this.navCtrl.navigateRoot(['./home']);
    } else {
      // User is not logged in, attempt to pre-fill rememberMe data
      const storedEmail = localStorage.getItem(AuthConstants.EMAIL);
      const storedPassword = localStorage.getItem(AuthConstants.PASSWORD);

      if (storedEmail) {
        // Update the signal state immutably (or use .update())
        this.postData.update(data => ({
            ...data,
            email: storedEmail,
            password: storedPassword || '', // Assuming password might be null
            rememberMe: true,
        }));
      }
    }
  }

  // Validation logic
  validateInputs(): boolean {
    const data = this.postData(); // Get current signal value
    const userEmail = data.email;
    const userPassword = data.password;

    return (
      userEmail && userEmail.length > 0 &&
      userPassword && userPassword.length > 0
    ) as boolean;
  }

  // Login execution logic
  continue() {
    const currentPostData = this.postData();

    if (this.validateInputs()) {
      this.clicked.set(true); // Start loading state

      this.authService.login(currentPostData).subscribe(
        (res: any) => {
          if (res.token) {
            // 1. Save authentication tokens and user data
            localStorage.setItem(AuthConstants.TOKEN, res.token);
            localStorage.setItem(AuthConstants.AUTH, JSON.stringify(res.user));

            const language = res.user.language || 'en';
            localStorage.setItem(Constants.KEY_DEFAULT_LANGUAGE, language);
            this.myEvent.setLanguageData(language);
            localStorage.setItem(AuthConstants.ROLE, res.role);

            // 2. Handle 'Remember Me' persistence
            const emailToStore = currentPostData.rememberMe ? currentPostData.email : '';
            const passwordToStore = currentPostData.rememberMe ? currentPostData.password : '';
            localStorage.setItem(AuthConstants.EMAIL, emailToStore);
            localStorage.setItem(AuthConstants.PASSWORD, passwordToStore);

            // 3. Navigate home
            this.navCtrl.navigateRoot(['./home']);

          } else {
            // Login failed (token missing in response)
            this.clicked.set(false);
            this.toastService.presentToast(this.translate.instant('wrong_combination_login'));
          }
        },
        (error: any) => {
          // API error
          this.clicked.set(false);
          this.toastService.presentToast(this.translate.instant('do_not_have_access_login'));
        }
      );
    } else {
      // Input validation failed
      this.clicked.set(false);
      this.toastService.presentToast(this.translate.instant('form_not_filled_right'));
    }
  }

  password_reset() {
    this.navCtrl.navigateForward(['password-reset']);
  }

  togglePassword(){
    this.showPassword.set(!this.showPassword());
  }
}
