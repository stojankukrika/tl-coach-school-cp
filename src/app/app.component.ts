import { Component, Inject, OnInit, OnDestroy, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG, AppConfig } from './core/config/app.config';
import { FcmService } from './core/services/fcm.service';
import { MyEvent } from './core/services/myevent.service';
import { Constants } from './models/contants.models';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { ToastService } from './core/services/toast.service';
import { StorageService } from './core/services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  // --- Services Injected ---
  private router = inject(Router);
  private platform = inject(Platform);
  private translate = inject(TranslateService);
  private fcmService = inject(FcmService);
  private navCtrl = inject(NavController);
  private myEvent = inject(MyEvent);
  private toastService = inject(ToastService);
  private storage = inject(StorageService);

  // --- Properties ---
  public rtlSide: WritableSignal<string> = signal('ltr');
  public isOnline: WritableSignal<boolean> = signal(navigator.onLine);

  constructor(@Inject(APP_CONFIG) public config: AppConfig) {
    this.initialize();
  }

  // --- Initialization and Lifecycle ---

  private initialize(): void {
    this.platform.ready().then(async () => {
      // 1. Critical: Setup Globalization first using Native Storage
      await this.loadGlobalization();
      
      // 2. Setup Listeners
      this.backButtonSubscribeMethod();
      this.setupConnectivityListeners();
      this.setupAppLifeCycleListener();
      
      // 3. Native UI
      await this.initEdgeToEdge();
      
      // 4. Delayed Initializations
      setTimeout(() => {
        this.safePushInit();
      }, 1000);
    });

    // Subscribe to language change events from the UI
    this.myEvent.getLanguageObservable().subscribe(value => {
      this.navCtrl.navigateRoot(['./']);
      this.globalize(value);
    });
  }

  async ngOnInit() {
    if (this.config.demoMode) {
      setTimeout(() => {
        this.language();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    // Note: platform.backButton is an Observable, normally handled by platform lifecycle
  }

  // --- Feature Methods ---
  /** * REFACTORED: Now uses StorageService (Capacitor Preferences) 
   * to survive store updates.
   */
  private async loadGlobalization(): Promise<void> {
    const defaultLang = await this.storage.get(Constants.KEY_DEFAULT_LANGUAGE);
    this.globalize(defaultLang);
  }

  /** Sets the translation language and RTL/LTR direction. */
  globalize(languagePriority: string | null): void {
    this.translate.setDefaultLang('en');
    const defaultLangCode = this.config.availableLanguages[0].code;
    const langToUse = languagePriority && languagePriority.length ? languagePriority : defaultLangCode;
    this.translate.use(langToUse);
    this.setDirectionAccordingly(langToUse);
  }

  /** Sets the HTML direction attribute and signal. */
  setDirectionAccordingly(lang: string): void {
    const direction = (lang === 'ar') ? 'rtl' : 'ltr';
    this.rtlSide.set(direction);
    document.dir = direction; // Important for global CSS flipping
  }

  private setupConnectivityListeners(): void {
    window.addEventListener('offline', () => this.isOnline.set(false));
    window.addEventListener('online', () => this.isOnline.set(true));
  }
  
  // --- Native/Capacitor Methods ---
  /** Handles back button logic with Capacitor App plugin instead of legacy navigator. */
  private backButtonSubscribeMethod(): void {
    let lastTimeBackPressed = 0;
    const timeLimit = 1500;
    this.platform.backButton.subscribeWithPriority(10, () => {
      const currentUrl = this.router.url;

      if (currentUrl === '/home' || currentUrl === '/') {
        const currentTime = new Date().getTime();

        if (currentTime - lastTimeBackPressed < timeLimit) {
          App.exitApp(); 
        } else {
          lastTimeBackPressed = currentTime;
          this.toastService.presentToast(this.translate.instant('press_again_to_exit'));
        }
      }
    });
  }

  private async setupAppLifeCycleListener(): Promise<void> {
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // Handle logic when app returns to foreground
      }
    });
  }

  private async initEdgeToEdge(): Promise<void> {
    // check if running on Android or iOS
    if (!this.platform.is('android') && !this.platform.is('ios')) {
      return;
    }
    if (this.platform.is('android')) {
      try {
        await EdgeToEdge.enable();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          this.updateStatusBarStyle();
        });
        await this.updateStatusBarStyle();
        await SplashScreen.hide();
      } catch (err:any) {
        console.log('Capacitor native plugin error:', err.message);
      }
    } else {
      await SplashScreen.hide();
    }
  }

  private async updateStatusBarStyle(): Promise<void> {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      await StatusBar.setStyle({ style: Style.Dark });
      await EdgeToEdge.setBackgroundColor({ color: '#000000' });
    } else {
      await StatusBar.setStyle({ style: Style.Light });
      await EdgeToEdge.setBackgroundColor({ color: '#ffffff' });
    }
  }

  async safePushInit() {
    try {
      await this.fcmService.initPush();
    } catch (e) {
      console.error('Push notification initialization failed', e);
    }
  }

  language(): void {
    this.router.navigate(['./change-language']);
  }
}