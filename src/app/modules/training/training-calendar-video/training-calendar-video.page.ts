import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingCalendarsServiceService } from "src/app/core/services/training-calendars-service.service";
import { ToastService } from "src/app/core/services/toast.service";
import { TranslateService } from "@ngx-translate/core";
import { AuthConstants } from "src/app/core/config/auth-constants";

@Component({
  selector: 'app-training-calendar-video',
  templateUrl: './training-calendar-video.page.html',
  styleUrls: ['./training-calendar-video.page.scss'],
  standalone: false
})
export class TrainingCalendarVideoPage {
  // Injekcija servisa
  private trainingService = inject(TrainingCalendarsServiceService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private activatedRoute = inject(ActivatedRoute);

  // Signals za stanje
  show = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  trainingCalendar = signal<any>(null);
  selectedFileName = signal<string | null>(null);

  // Interni podaci
  private id: string | null = null;
  private group: any;
  private fileBase64: string | null = null;

  constructor() {
    this.activatedRoute.params.subscribe(params => {
      this.id = params['id'] ?? null;
    });
  }

  ionViewWillEnter() {
    this.show.set(false);
    this.group = JSON.parse(localStorage.getItem(AuthConstants.GROUP) || '{}');
    this.loadData();
  }

  private loadData() {
    if (!this.id) return;

    const data = {
      team_group_training_calendar_id: this.id,
      team_group_id: this.group.id,
    };

    this.trainingService.show(this.id, data).subscribe({
      next: (res: any) => {
        this.trainingCalendar.set(res.training_calendar);
        this.show.set(true);
      }
    });
  }

  onSingleFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName.set(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        this.fileBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  addMemberFile() {
    if (!this.fileBase64) {
      this.toastService.presentToast(this.translate.instant('select_file_first'));
      return;
    }

    this.isUploading.set(true);

    const data = {
      media: this.fileBase64,
      team_group_training_calendar_id: this.trainingCalendar().id,
      team_group_id: this.group.id,
    };

    this.trainingService.addMemberMonthlyMedia(data).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.fileBase64 = null;
        this.selectedFileName.set(null);
        this.toastService.presentToast(this.translate.instant('file_added'));
      },
      error: () => {
        this.isUploading.set(false);
        this.toastService.presentToast(this.translate.instant('upload_error'));
      }
    });
  }
}
