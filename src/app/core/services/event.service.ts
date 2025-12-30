import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private httpService: HttpService) {
  }

  index(): Observable<any> {
    return this.httpService.get('team_event', []);
  }

  list(data): Observable<any> {
    return this.httpService.get('team_event/list', data);
  }

  show(id): Observable<any> {
    return this.httpService.get('team_event/' + id, []);
  }
}
