import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {

  constructor(private httpService: HttpService) {
  }

  index(data:any): Observable<any> {
    return this.httpService.get('team_member_statistic', data);
  }

  forTeamMember(data:any): Observable<any> {
    return this.httpService.get('team_member_statistic/for_team_member', data);
  }

  chartForTeamMember(data:any): Observable<any> {
    return this.httpService.post('team_member_statistic/chart_for_team_member', data);
  }

  forTeamMemberAll(data:any): Observable<any> {
    return this.httpService.get('team_member_statistic/for_team_member_all', data);
  }
  deleteMeasurement(data:any): Observable<any> {
    return this.httpService.post('team_member_statistic/delete_for_team_member', data);
  }
  updateMeasurement(data:any): Observable<any> {
    return this.httpService.post('team_member_statistic/update_for_team_member', data);
  }
}
