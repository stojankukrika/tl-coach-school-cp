import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpService} from './http.service';

@Injectable({
  providedIn: 'root'
})
export class GroupMemberService {

  private readonly httpService = inject(HttpService);
  constructor() {
  }

  index(data:any): Observable<any> {
    return this.httpService.get('team_group_members', data);
  }

  allGroups(data:any): Observable<any> {
    return this.httpService.get('team_groups/groups', data);
  }

  teamMemberships(data:any): Observable<any> {
    return this.httpService.get('team_groups/team_memberships', data);
  }

  create(data:any): Observable<any> {
    return this.httpService.post('team_group_members', data);
  }

  update(data:any): Observable<any> {
    return this.httpService.put('team_group_members/' + data.id, data);
  }

  show(data:any): Observable<any> {
    return this.httpService.get('team_group_members/' + data.id, data);
  }

  updatePhoto(data:any): Observable<any> {
    return this.httpService.put('team_group_members/avatar', data);
  }

  customFields(data:any): Observable<any> {
    return this.httpService.get('team_group_members/custom_fields', data);
  }

  delete(data:any): Observable<any> {
    return this.httpService.get('team_group_members/delete_from_group', data);
  }

  addMemberIntoGroup(data:any): Observable<any> {
    return this.httpService.put('team_group_members/add_member_into_group', data);
  }
}
