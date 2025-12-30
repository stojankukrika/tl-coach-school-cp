import { Injectable } from '@angular/core';
import {HttpService} from './http.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  constructor(private httpService: HttpService) {
  }

  presence(data:any): Observable<any> {
    return this.httpService.post('team_member_presence', data);
  }

  presenceForDate(data:any): Observable<any> {
    return this.httpService.post('team_member_presence/for_date', data);
  }

  presenceMonthly(data:any): Observable<any> {
    return this.httpService.post('team_member_presence/for_month', data);
  }

  payment(data:any): Observable<any> {
    return this.httpService.post('team_member_payment', data);
  }

  measurement(data:any): Observable<any> {
    return this.httpService.post('team_member_measurement', data);
  }
  lastMeasurements(data:any): Observable<any> {
    return this.httpService.post('team_member_measurement/last', data);
  }
  deleteLastMeasurements(data:any): Observable<any> {
    return this.httpService.post('team_member_measurement/last_delete', data);
  }

  competition(data:any): Observable<any> {
    return this.httpService.post('team_member_competition', data);
  }

  observation(data:any): Observable<any> {
    return this.httpService.post('team_member_observation', data);
  }

  notes(data:any): Observable<any> {
    return this.httpService.post('team_member_training_notes', data);
  }
}
