import {InjectionToken} from "@angular/core";

export const APP_CONFIG = new InjectionToken<AppConfig>("app.config");

export interface AppConfig {
  availableLanguages: Array<{ code: string, name: string }>;
  demoMode: boolean;
}

export const BaseAppConfig: AppConfig = {
  availableLanguages: [{
    code: 'latinica',
    name: 'Latinica'
  }, {
    code: 'en',
    name: 'English'
  }, {
    code: 'hr',
    name: 'Hrvatski'
  }, {
    code: 'ekavica',
    name: 'Ekavica'
  }, {
    code: 'mk',
    name: 'Македонски'
  }],
  demoMode: false
};
