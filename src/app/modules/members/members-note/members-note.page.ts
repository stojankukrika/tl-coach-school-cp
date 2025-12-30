import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { EntryService } from 'src/app/core/services/entry.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-members-note',
  templateUrl: './members-note.page.html',
  styleUrls: ['./members-note.page.scss'],
  standalone: false,
})
export class MembersNotePage implements OnInit {
  // --- Services ---
  private activatedRoute = inject(ActivatedRoute);
  private entryService = inject(EntryService);
  private storage = inject(StorageService);
  private toastService = inject(ToastService);

  // --- Signals & State ---
  public statusMembers = signal<any[]>([]);
  public selectedMemberId = signal<string | null>(null);
  public noteValue = signal<any | null>(null);
  public datetime = signal<string | null>(null);
  public group = signal<any>(null);

  // UI Flags
  public isLoading = signal(true);
  public isSubmitting = signal(false);
  public isToastOpen = signal(false);

  // Computed Validation
  public isValid = computed(() => !!this.selectedMemberId() && !!this.noteValue()?.trim());

  constructor() {}

  ngOnInit(): void {}

  async ionViewWillEnter() {
    this.isLoading.set(true);
    
    // 1. Load basic context from Storage
    const savedGroup = await this.storage.get(AuthConstants.GROUP);
    const savedMembers = await this.storage.get(AuthConstants.GROUP_MEMBERS) || [];
    
    this.group.set(savedGroup);
    const activeMembers = savedMembers.filter((m: any) => m.status === 'active');

    // 2. Handle Route Params and Fetch Presence
    this.activatedRoute.params.subscribe(params => {
      const time = params['time'] ?? null;
      this.datetime.set(time);

      const presenceQuery = {
        date_time: time,
        group_id: savedGroup?.id,
      };

      this.entryService.presenceForDate(presenceQuery).subscribe({
        next: (res: any) => {
          // Efficient lookup using a Set of IDs
          const presentIds = new Set(res.team_members.map((m: any) => m.team_member_id));
          const filtered = activeMembers.filter((m: any) => presentIds.has(m.id));
          
          this.statusMembers.set(filtered);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    });
  }

  /** Saves the note via API */
  saveEntry() {
    if (!this.isValid()) return;

    this.isSubmitting.set(true);

    const payload = {
      member_id: this.selectedMemberId(),
      value: this.noteValue(),
      date_time: this.datetime(),
      group_id: this.group()?.id,
      event_id: null,
    };

    this.entryService.notes(payload).subscribe({
      next: () => {
        this.noteValue.set(null); // Clear input
        this.isToastOpen.set(true);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastService.presentToast(err.error?.message || 'Error saving note');
      }
    });
  }
}