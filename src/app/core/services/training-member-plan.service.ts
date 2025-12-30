import { Injectable } from '@angular/core';
import {HttpService} from './http.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainingMemberPlanService {

  constructor(private httpService: HttpService) {
  }

  index(data): Observable<any> {
    return this.httpService.get('team_member_plan', data);
  }

  create(data): Observable<any> {
    return this.httpService.post('team_member_plan', data);
  }
}
