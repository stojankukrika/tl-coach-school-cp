import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(private httpService: HttpService) {
  }

  search(data:any): Observable<any> {
    return this.httpService.post('members/search', data);
  }
}
