import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { GroupTrainingService } from 'src/app/core/services/group-training.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-training-plan',
  templateUrl: './training-plan.page.html',
  styleUrls: ['./training-plan.page.scss'],
  standalone: false,
})
export class TrainingPlanPage implements OnInit {
  // --- Services ---
  private activatedRoute = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private router = inject(Router);
  private groupTrainingService = inject(GroupTrainingService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private storage = inject(StorageService);

  // --- Signals (State) ---
  public show = signal(false);
  public group = signal<any>(null);
  public training = signal<any>(null);
  public team_training_notes = signal<any[]>([]);
  public order = signal<number | null>(null);
  public clicked = signal(false);
  public readonly = signal(true);
  public viewType = signal<string | null>(null);

  private trainingId: string | null = null;

  ngOnInit() {}

  async ionViewWillEnter() {
    this.show.set(false);

    // REFACTORED: Loading ROLE and GROUP from Native Storage (Async)
    const [role, storedGroup] = await Promise.all([
      this.storage.get(AuthConstants.ROLE),
      this.storage.get(AuthConstants.GROUP)
    ]);

    this.group.set(storedGroup);
    
    // Set permissions based on native role string
    this.readonly.set(!(role === 'management' || role === 'top_coach'));

    this.activatedRoute.params.subscribe(params => {
      this.trainingId = params['id'] ?? null;
      this.order.set(params['order'] ?? null);

      if (this.group() && this.trainingId) {
        this.loadTrainingData();
      }
    });
  }

  private loadTrainingData() {
    this.groupTrainingService.showTraining({
      group_id: this.group().id,
      id: this.trainingId
    }).subscribe({
      next: (data) => {
        // Add coach_notes property if missing
        const trainingData = data.team_training;
        trainingData.coach_notes = trainingData.coach_notes ?? '';
        
        this.training.set(trainingData);
        this.team_training_notes.set(data.team_training_notes || []);
        this.show.set(true);
      },
      error: (err) => {
        this.toastService.presentToast(this.translate.instant('error_loading_data'));
      }
    });
  }

  setViewType(vt: string | null) {
    this.viewType.set(vt);
  }

  /** Update signal values from template */
  updateNote(field: 'note' | 'coach_notes', value: string) {
    this.training.update(prev => ({ ...prev, [field]: value }));
  }

  save() {
    const t = this.training();
    if (!t) return;

    this.clicked.set(true);
    this.groupTrainingService.updateNote({
      group_id: this.group().id,
      id: t.id,
      note: t.note,
      coach_notes: t.coach_notes
    }).subscribe({
      next: () => {
        this.clicked.set(false);
        this.navCtrl.pop();
      },
      error: (err) => {
        this.clicked.set(false);
        this.toastService.presentToast(err?.error?.message || 'Error saving');
      }
    });
  }

  presentMembers() {
    const t = this.training();
    this.router.navigate(['./present-members', t.date_formatted + 'T' + t.time_from, this.order()]);
  }

  memberNote() {
    const t = this.training();
    this.router.navigate(['./note-members', t.date_formatted + 'T' + t.time_from, this.order()]);
  }
}