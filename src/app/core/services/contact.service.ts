import {Injectable} from '@angular/core';
import {HttpService} from "./http.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private httpService: HttpService) {
  }

  contactUs(postData: any): Observable<any> {
    return this.httpService.put('contact', postData);
  }
}
