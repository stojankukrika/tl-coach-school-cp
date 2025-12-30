import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { EntryService } from 'src/app/core/services/entry.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-present-members',
  templateUrl: './present-members.page.html',
  styleUrls: ['./present-members.page.scss'],
  standalone: false,
})
export class PresentMembersPage implements OnInit {
  // --- Services ---
  private activatedRoute = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private entryService = inject(EntryService);
  private storage = inject(StorageService);

  // --- Signals & State ---
  public allMembers = signal<any[]>([]);
  public presentMembers = signal<any[]>([]);
  public notPresentMembers = signal<any[]>([]);
  public lateMembers = signal<any[]>([]);
  public sickMembers = signal<any[]>([]);

  // Context Signals
  public datetime = signal<string | null>(null);
  public order = signal<string | null>(null);
  public eventId = signal<string | null>(null);
  public isEvent = signal(false);
  public isLoading = signal(true);

  /**
   * Computed: Pending members (not yet marked)
   * This replaces the manual 'hideMe' logic.
   */
  public pendingMembers = computed(() => {
    const markedIds = new Set([
      ...this.presentMembers().map(m => m.id),
      ...this.notPresentMembers().map(m => m.id),
      ...this.lateMembers().map(m => m.id),
      ...this.sickMembers().map(m => m.id)
    ]);
    return this.allMembers().filter(m => !markedIds.has(m.id));
  });

  constructor() {}

  ngOnInit(): void {}

  async ionViewWillEnter() {
    this.isLoading.set(true);
    
    // Load context from storage
    const members = await this.storage.get(AuthConstants.GROUP_MEMBERS) || [];
    this.allMembers.set(members.filter((m: any) => m.status === 'active'));

    this.activatedRoute.params.subscribe(params => {
      this.datetime.set(params['time'] ?? null);
      this.order.set(params['order'] ?? null);
      
      if (params['event']) {
        this.eventId.set(params['event']);
        this.isEvent.set(true);
      } else {
        this.isEvent.set(false);
      }
      
      this.loadEntriesForDate();
    });
  }

  /** Marks a member's presence status */
  presence(member: any, statusId: number = 1) {
    const data = {
      member_id: member.member_id,
      status_id: statusId,
      date_time: this.datetime(),
      group_id: !this.isEvent() ? member.group_id : null,
      event_id: this.eventId(),
    };

    this.entryService.presence(data).subscribe(() => {
      this.loadEntriesForDate();
    });
  }

  /** Fetches attendance data and categorizes members */
  private async loadEntriesForDate() {
    const group = await this.storage.get(AuthConstants.GROUP);
    const data = {
      date_time: this.datetime(),
      event_id: this.eventId(),
      group_id: !this.isEvent() ? group?.id : null
    };

    this.entryService.presenceForDate(data).subscribe({
      next: (res: any) => {
        // Create a map for $O(1)$ lookup instead of nested loops
        const memberLookup = new Map(this.allMembers().map(m => [m.id, m]));
        
        const tempPresent: any[] = [];
        const tempAbsent: any[] = [];
        const tempLate: any[] = [];
        const tempSick: any[] = [];

        res.team_members.forEach((entry: any) => {
          const member = memberLookup.get(entry.team_member_id);
          if (member) {
            if (entry.status_id === 1) tempPresent.push(member);
            else if (entry.status_id === 2) tempSick.push(member);
            else if (entry.status_id === 3) tempLate.push(member);
            else if (entry.status_id === 4) tempAbsent.push(member);
          }
        });

        this.presentMembers.set(tempPresent);
        this.notPresentMembers.set(tempAbsent);
        this.lateMembers.set(tempLate);
        this.sickMembers.set(tempSick);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}