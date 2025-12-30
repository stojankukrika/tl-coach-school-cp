import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MemberService } from 'src/app/core/services/member.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-member-search',
  templateUrl: './member-search.page.html',
  styleUrls: ['./member-search.page.scss'],
  standalone: false,
})
export class MemberSearchPage implements OnInit {
  // --- Services Injected ---
  private memberService = inject(MemberService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  // --- Signals & State ---
  public results = signal<any[]>([]);
  public isLoading = signal(false);

  // Computed: Automatically updates whenever results() changes
  public showList = computed(() => this.results().length > 0);

  constructor() {}

  ngOnInit(): void {}

  /**
   * Handles real-time search. 
   * Note: ionInput is usually preferred over ionChange for live filtering.
   */
  handleSearch(event: any): void {
    const query = event.target.value?.toLowerCase() || '';
    
    if (query.length > 1) {
      this.isLoading.set(true);
      
      this.memberService.search({ search: query }).subscribe({
        next: (data) => {
          this.results.set(data.members || []);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          const errorMsg = err?.error?.message || 'search_error';
          this.toastService.presentToast(this.translate.instant(errorMsg));
        }
      });
    } else {
      this.results.set([]);
      this.isLoading.set(false);
    }
  }

  /** Navigates to member details */
  selectMember(member: any): void {
    this.router.navigate(['./member-details', member.id]);
  }
}