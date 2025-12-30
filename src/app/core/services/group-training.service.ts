import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpService} from './http.service';

@Injectable({
  providedIn: 'root'
})
export class GroupTrainingService {
  constructor(private httpService: HttpService) {
  }

  index(data:any): Observable<any> {
    return this.httpService.get('team_groups_trainings', data);
  }

  oldTrainings(data:any): Observable<any> {
    return this.httpService.get('team_groups_trainings/old_trainings', data);
  }

  custom(data:any): Observable<any> {
    return this.httpService.post('team_groups_trainings/custom', data);
  }

  showTraining(data:any): Observable<any> {
    return this.httpService.get('team_groups_trainings/' + data.id, data);
  }

  updateNote(data:any): Observable<any> {
    return this.httpService.post('team_groups_trainings', data);
  }

  delete(data:any): Observable<any> {
    return this.httpService.put('team_groups_trainings/' + data.id + '/delete', data);
  }

  presenceChart(data:any): Observable<any> {
    return this.httpService.get('team_groups_trainings/' + data.group_id + '/presence_chart', data);
  }
}
