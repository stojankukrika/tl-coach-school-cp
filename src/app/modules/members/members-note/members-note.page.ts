import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthConstants } from "src/app/core/config/auth-constants";
import { EntryService } from "src/app/core/services/entry.service";

@Component({
  selector: 'app-members-note',
  templateUrl: './members-note.page.html',
  styleUrls: ['./members-note.page.scss'],
  standalone: false
})
export class MembersNotePage {
  // Injekcija servisa
  private activatedRoute = inject(ActivatedRoute);
  private entryService = inject(EntryService);
  private router = inject(Router);

  // Signals za reaktivno stanje
  show = signal<boolean>(false);
  statusMembers = signal<any[]>([]);
  isToastNoteOpen = signal<boolean>(false);

  // Podaci za formu (Signals)
  selectedMemberId = signal<string | null>(null);
  noteValue = signal<string>('');

  // Privatne varijable za internu logiku
  private datetime: string | null = null;
  private group: any;

  ionViewWillEnter() {
    this.group = JSON.parse(localStorage.getItem(AuthConstants.GROUP) || '{}');
    const allMembers = JSON.parse(localStorage.getItem(AuthConstants.GROUP_MEMBERS) || '[]');
    const activeMembers = allMembers.filter((m: any) => m.status === 'active');

    this.activatedRoute.params.subscribe(params => {
      this.datetime = params['time'] ?? null;
      this.show.set(false);

      const requestData = {
        date_time: this.datetime,
        group_id: this.group.id,
      };

      this.entryService.presenceForDate(requestData).subscribe({
        next: (res: any) => {
          // Filtriramo članove koji su prisutni na taj dan
          const filtered = activeMembers.filter((member: any) =>
            res.team_members.some((entry: any) => entry.team_member_id === member.id)
          );

          this.statusMembers.set(filtered);
          this.show.set(true);
        }
      });
    });
  }

  setNoteOpen(isOpen: boolean) {
    this.isToastNoteOpen.set(isOpen);
  }

  saveEntry() {
    if (!this.selectedMemberId() || !this.noteValue()) return;

    const saveData = {
      member_id: this.selectedMemberId(),
      value: this.noteValue(),
      date_time: this.datetime,
      group_id: this.group.id,
      event_id: null,
    };

    this.entryService.notes(saveData).subscribe({
      next: () => {
        this.noteValue.set(''); // Resetujemo textarea
        this.setNoteOpen(true);
      }
    });
  }
}
