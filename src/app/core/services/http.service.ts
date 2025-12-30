// src/app/core/services/http.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpService {
  private readonly http = inject(HttpClient);

  post(serviceName: string, data: any, customHeaders: any = null) {
    const url = environment.apiUrl + serviceName;
    const headers = customHeaders ? new HttpHeaders(customHeaders) : undefined;
    return this.http.post(url, data, { headers });
  }

  put(serviceName: string, data: any, customHeaders: any = null) {
    const url = environment.apiUrl + serviceName;
    const headers = customHeaders ? new HttpHeaders(customHeaders) : undefined;
    return this.http.put(url, data, { headers });
  }

  get(serviceName: string, data: any): Observable<any> {
    let params = '';
    if (!_.isObject(data) && !_.isNaN(data)) {
      params = `?${data}`;
    } else if (_.isObject(data)) {
      const queryData = data as { [key: string]: any };
      params = '?' + _.keys(queryData)
        .filter(key => queryData[key] !== null && queryData[key] !== 'null')
        .map(key => `${key}=${encodeURIComponent(queryData[key])}`)
        .join('&');
    }
    return this.http.get(environment.apiUrl + serviceName + params);
  }
}