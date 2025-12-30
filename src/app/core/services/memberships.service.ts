import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembershipsService {

  constructor(private httpService: HttpService) {
  }

  index(data:any): Observable<any> {
    return this.httpService.post('memberships', data);
  }

  changeStatus(data:any): Observable<any> {
    return this.httpService.post('memberships/change_status', data);
  }

  create(data:any): Observable<any> {
    return this.httpService.post('memberships/create', data);
  }

  listAll(data:any): Observable<any> {
    return this.httpService.get('memberships/list_all', data);
  }

  membershipAmount(data:any): Observable<any> {
    return this.httpService.get('memberships/membership_amount', data);
  }

  setAll(data:any): Observable<any> {
    return this.httpService.post('memberships/set_all', data);
  }

  lastThreeMonths(data:any): Observable<any> {
    return this.httpService.get('memberships/last_three_months', data);
  }

  info(data:any): Observable<any> {
    return this.httpService.get('memberships/info', data);
  }
}
