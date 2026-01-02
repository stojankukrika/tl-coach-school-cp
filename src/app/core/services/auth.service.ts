import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable, from, switchMap, map} from 'rxjs';
import {tap} from 'rxjs/operators';
import {HttpService} from './http.service';
import {AuthConstants} from '../config/auth-constants';
import {StorageService} from './storage.service'; // Ensure this path is correct
import {LoadingController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use null as initial value to differentiate between "loading" and "no user"
  userData$ = new BehaviorSubject<any>(null);

  private readonly httpService = inject(HttpService);
  private readonly storage = inject(StorageService);
  private readonly loadingCtrl = inject(LoadingController);

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
      switchMap((res: any) => {
        if (!res?.token) {
          throw new Error('No token returned');
        }

        return from(this.persistLogin(res, postData)).pipe(
          map(() => res)
        );
      })
    );
  }


  private async persistLogin(res: any, postData: any): Promise<void> {
    await this.storage.set(AuthConstants.TOKEN, res.token);
    await this.storage.set(AuthConstants.AUTH, res.user);
    await this.storage.set(AuthConstants.ROLE, res.role);

    await this.storage.set(
      AuthConstants.EMAIL,
      postData.rememberMe ? postData.email : ''
    );

    await this.storage.set(
      AuthConstants.PASSWORD,
      postData.rememberMe ? postData.password : ''
    );

    this.userData$.next(res.user);
  }

  async logout() {
    const loading = await this.loadingCtrl.create({
      spinner: 'dots'
    });

    await loading.present();
    // Clear all keys from Native Storage
    await this.storage.remove(AuthConstants.TOKEN);
    await this.storage.remove(AuthConstants.AUTH);
    await this.storage.remove(AuthConstants.ROLE);
    await this.storage.remove(AuthConstants.GROUP);
    await this.storage.remove(AuthConstants.GROUP_MEMBERS);
    await this.storage.remove(AuthConstants.GROUP_TRAINERS);
    await this.storage.remove(AuthConstants.MEASUREMENT_CATEGORIES);

    // Clear the stream
    this.userData$.next(null);
    await this.loadingCtrl.dismiss();
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

  async forceLogout() {
    await this.storage.clear();
    this.userData$.next(null);
  }
}
