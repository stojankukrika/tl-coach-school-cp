import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamMemberServiceService {

  constructor(
    private httpService: HttpService,
  ) {
  }

  index(data:any): Observable<any> {
    return this.httpService.get('team_groups', data);
  }

  store(data:any): Observable<any> {
    return this.httpService.post('member_groups', data);
  }
}
