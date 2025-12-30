import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpService} from './http.service';

@Injectable({
  providedIn: 'root'
})
export class GroupTrainerService {
  constructor(private httpService: HttpService) {
  }
  trainers(data): Observable<any> {
    return this.httpService.get('team_groups_trainers', data);
  }
  entries(data): Observable<any> {
    return this.httpService.get('team_groups_trainers/entries', data);
  }

  presence(data): Observable<any> {
    return this.httpService.post('team_groups_trainers', data);
  }
}
