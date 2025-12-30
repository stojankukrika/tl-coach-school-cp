import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { Constants } from 'src/app/core/models/contants.models';
import { AuthService } from 'src/app/core/services/auth.service';
import { MyEvent } from 'src/app/core/services/myevent.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ToastService } from 'src/app/core/services/toast.service';

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
  private navCtrl = inject(NavController);
  public translate = inject(TranslateService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private myEvent = inject(MyEvent);
  private storage = inject(StorageService); // Refactored from 'stage' for clarity

  public clicked: WritableSignal<boolean> = signal(false);

  public postData: WritableSignal<PostData> = signal({
    email: '',
    password: '',
    rememberMe: false,
  });

  constructor() {}

  ngOnInit(): void {
    console.log(this.postData()); //{email: '', password: '', rememberMe: false}
    
  }

  ionViewWillEnter() {
    this.checkIsUserLogin();
  }

  /**
   * Refactored to use async StorageService.
   * Prevents loop by ensuring token checks match Interceptor storage.
   */
  private async checkIsUserLogin() {
    const token = await this.storage.get(AuthConstants.TOKEN);

    if (token && token !== '') {
      this.navCtrl.navigateRoot(['./home']);
    } else {
      const storedEmail = await this.storage.get(AuthConstants.EMAIL);
      const storedPassword = await this.storage.get(AuthConstants.PASSWORD);

      if (storedEmail) {
        this.postData.update(data => ({
            ...data,
            email: storedEmail,
            password: storedPassword || '',
            rememberMe: true,
        }));
      }
    }
  }

  validateInputs(): boolean {
    const data = this.postData();
    return (data.email?.length > 0 && data.password?.length > 0);
  }

  continue() {
    const currentPostData = this.postData();

    if (this.validateInputs()) {
      this.clicked.set(true);

      this.authService.login(currentPostData).subscribe({
        next: async (res: any) => {
          if (res.token) {
            // 1. Save authentication and user data via StorageService
            await this.storage.set(AuthConstants.TOKEN, res.token);
            await this.storage.set(AuthConstants.AUTH, res.user);
            await this.storage.set(AuthConstants.ROLE, res.role);

            const language = res.user.language || 'en';
            await this.storage.set(Constants.KEY_DEFAULT_LANGUAGE, language);
            this.myEvent.setLanguageData(language);

            // 2. Handle 'Remember Me' persistence
            if (currentPostData.rememberMe) {
              await this.storage.set(AuthConstants.EMAIL, currentPostData.email);
              await this.storage.set(AuthConstants.PASSWORD, currentPostData.password);
            } else {
              await this.storage.remove(AuthConstants.EMAIL);
              await this.storage.remove(AuthConstants.PASSWORD);
            }

            // 3. Navigate home
            this.navCtrl.navigateRoot(['./home']);
          } else {
            this.handleLoginError('wrong_combination_login');
          }
        },
        error: (error: any) => {
          this.handleLoginError('do_not_have_access_login');
        }
      });
    } else {
      this.handleLoginError('form_not_filled_right');
    }
  }

  private handleLoginError(translationKey: string) {
    this.clicked.set(false);
    this.toastService.presentToast(this.translate.instant(translationKey));
  }

  password_reset() {
    this.navCtrl.navigateForward(['password-reset']);
  }
}