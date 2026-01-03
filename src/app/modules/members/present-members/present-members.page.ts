import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { EntryService } from 'src/app/core/services/entry.service';

@Component({
  selector: 'app-present-members',
  templateUrl: './present-members.page.html',
  styleUrls: ['./present-members.page.scss'],
  standalone: false
})
export class PresentMembersPage {
  private activatedRoute = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private entryService = inject(EntryService);
  private router = inject(Router);

  show = signal<boolean>(false);
  members = signal<any[]>([]);
  presentMembers = signal<any[]>([]);
  notPresentMembers = signal<any[]>([]);
  hideMe = signal<Record<number, boolean>>({});

  group = signal<any>(null);
  datetime = signal<string | null>(null);
  order = signal<number | null>(null);

  ionViewWillEnter() {
    this.activatedRoute.params.subscribe(params => {
      this.datetime.set(params['time'] ?? null);
      this.order.set(params['order'] ?? null);
      this.group.set(JSON.parse(localStorage.getItem(AuthConstants.GROUP) || '{}'));
      this.loadInitialMembers();
    });
  }

  private loadInitialMembers() {
    const allMembers = JSON.parse(localStorage.getItem(AuthConstants.GROUP_MEMBERS) || '[]');
    this.members.set(allMembers.filter((m: any) => m.status === 'active'));
    this.show.set(true);
    this.loadEntriesForDate();
  }

  presence(member: any, statusId: number) {
    const data = {
      member_id: member.member_id || member.id,
      status_id: statusId,
      date_time: this.datetime(),
      group_id: this.group()?.id
    };

    this.entryService.presence(data).subscribe({
      next: () => this.loadEntriesForDate()
    });
  }

  loadEntriesForDate() {
    this.entryService.presenceForDate({
      date_time: this.datetime(),
      group_id: this.group()?.id
    }).subscribe({
      next: (res: any) => {
        const tempPresent: any[] = [];
        const tempNotPresent: any[] = [];
        const newHideMe: Record<number, boolean> = {};

        res.team_members.forEach((entry: any) => {
          newHideMe[entry.team_member_id] = true;
          const memberObj = this.members().find(m => m.id === entry.team_member_id);
          if (memberObj) {
            if (entry.status_id === 1) tempPresent.push(memberObj);
            else if (entry.status_id === 4) tempNotPresent.push(memberObj);
          }
        });

        this.hideMe.set(newHideMe);
        this.presentMembers.set(tempPresent);
        this.notPresentMembers.set(tempNotPresent);
      }
    });
  }

  memberDetails(member: any) {
    this.router.navigate(['./member-details', member.id || member.member_id]);
  }
}
