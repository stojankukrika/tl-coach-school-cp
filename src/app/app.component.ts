import { Component, Inject, OnInit, OnDestroy, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

// Services and Config
import { MyEvent } from './core/services/myevent.service';
import { Constants } from './core/models/contants.models';
import { FcmService } from './core/services/fcm.service';
import { StorageService } from './core/services/storage.service'; // Assumed from your second code
import { ToastService } from './core/services/toast.service';     // Assumed from your second code
import { APP_CONFIG, AppConfig } from './core/config/app.config';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  // --- Services Injected (Modern Pattern) ---
  private router = inject(Router);
  private platform = inject(Platform);
  private translate = inject(TranslateService);
  private fcmService = inject(FcmService);
  private navCtrl = inject(NavController);
  private myEvent = inject(MyEvent);
  private storage = inject(StorageService);
  private toastService = inject(ToastService);

  // --- Properties (Using Signals for Performance) ---
  public rtlSide: WritableSignal<string> = signal('ltr');
  public isOnline: WritableSignal<boolean> = signal(navigator.onLine);

  constructor(@Inject(APP_CONFIG) public config: AppConfig) {
    this.initialize();
  }

  // --- Initialization and Lifecycle ---

  private initialize(): void {
    this.platform.ready().then(async () => {
      // 1. Globalization - Load saved language preference
      await this.loadGlobalization();
      
      // 2. Listeners
      this.backButtonSubscribeMethod();
      this.setupConnectivityListeners();
      this.setupAppLifeCycleListener();
      
      // 3. Native UI Setup
      await this.initNativeUI();
      
      // 4. Background Services
      this.safePushInit();
    });

    // Handle language change events from Settings/Language pages
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
    // Standard platform observables like backButton are handled by Ionic/Capacitor lifecycle
  }

  // --- Feature Methods ---

  private async loadGlobalization(): Promise<void> {
    const defaultLang = await this.storage.get(Constants.KEY_DEFAULT_LANGUAGE);
    this.globalize(defaultLang);
  }

  /** Sets translation language and UI direction */
  globalize(languagePriority: string | null): void {
    this.translate.setDefaultLang('en');
    const defaultLangCode = this.config.availableLanguages[0].code;
    const langToUse = languagePriority && languagePriority.length ? languagePriority : defaultLangCode;
    
    this.translate.use(langToUse);
    this.setDirectionAccordingly(langToUse);
  }

  /** Syncs Signal, HTML dir attribute, and Sidebar side */
  setDirectionAccordingly(lang: string): void {
    const direction = (lang === 'ar') ? 'rtl' : 'ltr';
    this.rtlSide.set(direction);
    document.dir = direction; // Required for CSS [dir="rtl"] selectors
  }

  private setupConnectivityListeners(): void {
    window.addEventListener('offline', () => this.isOnline.set(false));
    window.addEventListener('online', () => this.isOnline.set(true));
  }
  
  // --- Native/Capacitor Methods ---

  /** Refactored Back Button: Exit on double-tap at Home */
  private backButtonSubscribeMethod(): void {
    let lastTimeBackPressed = 0;
    const timeLimit = 1500;

    this.platform.backButton.subscribeWithPriority(10, () => {
      const currentUrl = this.router.url;

      // Check if user is on a root page
      if (currentUrl === '/home' || currentUrl === '/' || currentUrl === '/tabs/home') {
        const currentTime = new Date().getTime();

        if (currentTime - lastTimeBackPressed < timeLimit) {
          App.exitApp(); // Capacitor App Plugin
        } else {
          lastTimeBackPressed = currentTime;
          this.toastService.presentToast(this.translate.instant('press_again_to_exit'));
        }
      } else {
        // Default behavior: go back
        this.navCtrl.back();
      }
    });
  }

  private async setupAppLifeCycleListener(): Promise<void> {
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // Logic for returning from background (e.g., refresh token)
      }
    });
  }

  private async initNativeUI(): Promise<void> {
    try {
      if (this.platform.is('capacitor')) {
        // Set Status Bar to be visible and white as per your original code
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
        await SplashScreen.hide();
      }
    } catch (err) {
      console.warn('Native UI initialization skipped (Web/Browser mode)');
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