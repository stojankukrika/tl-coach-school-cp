import { Component, Inject, OnInit, signal, WritableSignal } from '@angular/core';
import { NavController } from '@ionic/angular';
import { APP_CONFIG, AppConfig } from 'src/app/core/config/app.config';
import { Constants } from 'src/app/core/models/contants.models';
import { AuthService } from 'src/app/core/services/auth.service';
import { MyEvent } from 'src/app/core/services/myevent.service';
import { ToastService } from 'src/app/core/services/toast.service';

// Define the shape of a language object for better type safety
interface Language {
  code: string;
  name: string;
}

@Component({
  selector: 'app-change-language',
  templateUrl: './change-language.page.html',
  styleUrls: ['./change-language.page.scss'],
  standalone: false
})
export class ChangeLanguagePage implements OnInit {
  // 1. Convert 'defaultLanguageCode' to a WritableSignal
  // This value changes when the user clicks a language (onLanguageClick)
  defaultLanguageCode: WritableSignal<string>; 
  
  // 2. Convert 'languages' to a WritableSignal (or just a readonly property)
  // Since this array is initialized once in the constructor and never changes,
  // making it a signal is optional, but we'll do it for consistency
  languages: WritableSignal<Language[]>; 

  constructor(
    @Inject(APP_CONFIG) private config: AppConfig, 
    private myEvent: MyEvent, 
    private navCtrl: NavController,
    public authService: AuthService, 
    public toastService: ToastService
  ) {
    // Initialize the signals in the constructor
    const availableLanguages = this.config.availableLanguages as Language[];
    this.languages = signal(availableLanguages);

    let initialLangCode = availableLanguages[0].code;
    const storedLang = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
    
    if (storedLang) {
      initialLangCode = storedLang;
    }
    
    // Set the initial value for the language code signal
    this.defaultLanguageCode = signal(initialLangCode);
  }

  ngOnInit() {
    // Initialization logic remains the same
  }

  onLanguageClick(language: Language) {
    // 3. Update the signal using the .set() method
    this.defaultLanguageCode.set(language.code);
  }

  languageConfirm() {
    // Get the current value of the signal using the function call (reader)
    const newLanguageCode = this.defaultLanguageCode(); 
    
    this.myEvent.setLanguageData(newLanguageCode);
    window.localStorage.setItem(Constants.KEY_DEFAULT_LANGUAGE, newLanguageCode);
    
    // Pass the signal value to the service call
    this.authService.updateLanguage({ 'language': newLanguageCode }).subscribe(
      () => {
        this.navCtrl.pop();
      },
      (data: any) => {
        this.toastService.presentToast(data.error.message);
      }
    );
  }

}