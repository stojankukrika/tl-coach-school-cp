import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { ToastService } from 'src/app/core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { GroupTrainingService } from 'src/app/core/services/group-training.service';

@Component({
  selector: 'app-training-plan',
  templateUrl: './training-plan.page.html',
  styleUrls: ['./training-plan.page.scss'],
  standalone: false
})
export class TrainingPlanPage {
  // Injekcija servisa
  private activatedRoute = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private route = inject(Router);
  private groupTrainingService = inject(GroupTrainingService);
  private toastService = inject(ToastService);
  public translate = inject(TranslateService);

  // Signals za stanje
  show = signal<boolean>(false);
  training = signal<any>(null);
  teamTrainingNotes = signal<any[]>([]);
  clicked = signal<boolean>(false);
  readonly = signal<boolean>(true);
  viewType = signal<string | null>(null);

  // Proste varijable za parametre
  id: any;
  order = signal<number | null>(null);
  group: any;

  ionViewWillEnter() {
    this.show.set(false);

    // Provjera permisija
    const role = localStorage.getItem(AuthConstants.ROLE);
    this.readonly.set(!(role === 'management' || role === 'top_coach'));

    this.activatedRoute.params.subscribe(params => {
      this.id = params['id'] ?? null;
      this.order.set(params['order'] ?? null);
      this.group = JSON.parse(localStorage.getItem(AuthConstants.GROUP) || '{}');

      this.loadData();
    });
  }

  private loadData() {
    this.groupTrainingService.showTraining({ group_id: this.group.id, id: this.id }).subscribe({
      next: (data: any) => {
        // Postavljamo coach_notes na prazno ako već ne postoje
        const trainingData = data.team_training;
        if (!trainingData.coach_notes) trainingData.coach_notes = '';

        this.training.set(trainingData);
        this.teamTrainingNotes.set(data.team_training_notes || []);
        this.show.set(true);
      }
    });
  }

  setViewType(vt: string | null) {
    this.viewType.set(vt);
  }

  // Pomoćne funkcije za ažuriranje podataka unutar signala (ngModel alternativa za signale)
  updateNote(val: string) {
    this.training.update(t => ({ ...t, note: val }));
  }

  updateCoachNote(val: string) {
    this.training.update(t => ({ ...t, coach_notes: val }));
  }

  save() {
    const currentTraining = this.training();
    if (!currentTraining) return;

    this.clicked.set(true);
    this.groupTrainingService.updateNote({
      group_id: this.group.id,
      id: currentTraining.id,
      note: currentTraining.note,
      coach_notes: currentTraining.coach_notes
    }).subscribe({
      next: () => {
        this.clicked.set(false);
        this.navCtrl.pop();
      },
      error: (err: any) => {
        this.clicked.set(false);
        this.toastService.presentToast(err.error?.message || 'Error saving');
      }
    });
  }

  presentMembers() {
    const t = this.training();
    this.route.navigate(['./present-members', `${t.date_formatted}T${t.time_from}`, this.order()]);
  }

  memberNote() {
    const t = this.training();
    this.route.navigate(['./note-members', `${t.date_formatted}T${t.time_from}`, this.order()]);
  }
}
