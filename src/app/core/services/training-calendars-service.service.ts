import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainingCalendarsServiceService {

  constructor(private httpService: HttpService) {
  }

  index(data:any): Observable<any> {
    return this.httpService.get('training_calendars', data);
  }

  show(id:any, data:any): Observable<any> {
    return this.httpService.get('training_calendars/' + id, data);
  }

  getMemberMonthlyResult(data:any): Observable<any> {
    return this.httpService.get('training_calendars_result', data);
  }

  addMemberMonthlyMedia(data:any): Observable<any> {
    return this.httpService.put('training_calendars_media', data);
  }
}
