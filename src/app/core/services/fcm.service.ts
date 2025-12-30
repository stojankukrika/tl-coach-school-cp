import {Injectable} from '@angular/core';

import {Capacitor} from '@capacitor/core';

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

import {Router} from '@angular/router';
import {HttpService} from './http.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FcmService {
  constructor(private router: Router, private httpService: HttpService) {
  }

  initPush() {
    const isPushNotificationsAvailable = Capacitor.isPluginAvailable('PushNotifications');
    if (isPushNotificationsAvailable) {
      // Request permission to use push notifications
      // iOS will prompt user and return if they granted permission or not
      // Android will just grant without prompting
      PushNotifications.requestPermissions().then((result:any) => {
        if (result.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register();
        } else {
          // Show some error
        }
      });
      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration', (token: Token) => {
        this.register({token: token.value}).subscribe(() => {
        });
        //alert('Push registration success, token: ' + token.value);
      });

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError', (error: any) => {
        this.error({token: JSON.stringify(error)}).subscribe(() => {
        });
        //alert('Error on registration: ' + JSON.stringify(error));
      });

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          this.received({id: notification.data.id}).subscribe(() => {
            this.router.navigate(['./notifications']);
          });
          // alert('Push received: ' + JSON.stringify(notification));
        },
      );
      // Method called when tapping on a notification
      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (action: ActionPerformed) => {
          this.received({id: action.notification.data.id}).subscribe(() => {
            this.router.navigate(['./notifications']);
          });
          // alert('Push received: ' + JSON.stringify(action));
        },
      );
    }
  }

  register(data:any): Observable<any> {
    return this.httpService.put('fcm_user', data);
  }

  error(data:any): Observable<any> {
    return this.httpService.put('fcm_user/error', data);
  }

  received(id:any): Observable<any> {
    return this.httpService.put('notification/' + id + '/received', []);
  }
}
