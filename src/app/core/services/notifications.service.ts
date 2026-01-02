import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpService} from './http.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private readonly httpService = inject(HttpService);
  constructor() {
  }

  read(data:any): Observable<any> {
    return this.httpService.put('notification/' + data.id + '/read', data);
  }

  show(id:any): Observable<any> {
    return this.httpService.get('notification/' + id, []);
  }

  index(data: any): Observable<any> {
    return this.httpService.get('notifications', data);
  }

  create(notification: any): Observable<any> {
    return this.httpService.put('notification', notification);
  }

  createForEvent(id: any, notification: any): Observable<any> {
    return this.httpService.put('notification/' + id + '/for_event', notification);
  }
}
