import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpService} from './http.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private httpService: HttpService) {
  }

  read(data:any): Observable<any> {
    return this.httpService.put('notification/' + data.id + '/read', data);
  }

  show(id:any): Observable<any> {
    return this.httpService.get('notification/' + id, []);
  }

  index(): Observable<any> {
    return this.httpService.get('notifications', []);
  }
}
