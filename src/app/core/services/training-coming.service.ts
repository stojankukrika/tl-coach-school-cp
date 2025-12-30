import { Injectable } from '@angular/core';
import {HttpService} from './http.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainingComingService {

  constructor(private httpService: HttpService) {
  }

  index(data): Observable<any> {
    return this.httpService.get('training_coming', data);
  }

}
