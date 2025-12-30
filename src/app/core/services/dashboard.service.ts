import { Injectable } from '@angular/core';
import {HttpService} from './http.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private httpService: HttpService,
  ) {}

  index(): Observable<any> {
    return this.httpService.get('dashboard/sport-school', []);
  }

  rate(): Observable<any> {
    return this.httpService.get('dashboard/rate', []);
  }

  cancel(): Observable<any> {
    return this.httpService.get('dashboard/cancel', []);
  }
}
