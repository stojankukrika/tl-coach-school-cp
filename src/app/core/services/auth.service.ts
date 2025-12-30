import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from './http.service';
import { AuthConstants } from '../config/auth-constants';
import { StorageService } from './storage.service'; // Ensure this path is correct
import { LoadingController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use null as initial value to differentiate between "loading" and "no user"
  userData$ = new BehaviorSubject<any>(null);
  private isLoggingOut = false;

  private readonly httpService = inject(HttpService);
  private readonly storage = inject(StorageService);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly router = inject(Router);
  constructor() {
    // Automatically try to load the user when the app starts
    this.loadUserData();
  }

  // Helper to initialize the app state from native storage
  private async loadUserData() {
    const user = await this.storage.get(AuthConstants.AUTH);
    if (user) {
      this.userData$.next(user);
    }
  }

  // Update login to save the data to Native Storage automatically
  login(postData: any): Observable<any> {
    return this.httpService.put('login', postData).pipe(
      tap(async (res: any) => {
        if (res && res.token) {
          await this.storage.set(AuthConstants.TOKEN, res.token);
          await this.storage.set(AuthConstants.AUTH, res.user);
          await this.storage.set(AuthConstants.ROLE, res.role);
          // Set any other initial data needed
          this.userData$.next(res.user);
        }
      })
    );
  }
async logout() {
  if (this.isLoggingOut) return;
  this.isLoggingOut = true;

  const loader = await this.loadingCtrl.create({ spinner: 'circular' });
  await loader.present();

  try {
    // 1. Remove ONLY session-specific data
    await this.storage.remove(AuthConstants.TOKEN);
    await this.storage.remove(AuthConstants.AUTH);
    await this.storage.remove(AuthConstants.ROLE); 
    await this.storage.remove(AuthConstants.PERMISSIONS);
    await this.storage.remove(AuthConstants.APPSETTINGS);
    
    // DO NOT call this.storage.clear() here

    this.userData$.next(null);
    this.router.navigateByUrl('/sign-in', { replaceUrl: true });
  } finally {
    await loader.dismiss();
    this.isLoggingOut = false;
  }
}
  // Standard API wrappers (Interceptor handles the Token now)
  profile(postData: any): Observable<any> {
    return this.httpService.put('profile', postData);
  }

  updateLanguage(postData: any): Observable<any> {
    return this.httpService.put('profile/language', postData);
  }

  updateTeam(postData: any): Observable<any> {
    return this.httpService.put('profile/update_team', postData);
  }

  resetPassword(postData: any): Observable<any> {
    return this.httpService.put('reset_password', postData);
  }

  updatePhoto(data: any): Observable<any> {
    return this.httpService.put('profile/update_photo', data);
  }

  info(): Observable<any> {
    return this.httpService.get('profile/info', []);
  }
}