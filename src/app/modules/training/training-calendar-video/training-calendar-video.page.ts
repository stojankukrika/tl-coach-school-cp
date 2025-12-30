import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { ToastService } from 'src/app/core/services/toast.service';
import { TrainingCalendarsServiceService } from 'src/app/core/services/training-calendars-service.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-training-calendar-video',
  templateUrl: './training-calendar-video.page.html',
  styleUrls: ['./training-calendar-video.page.scss'],
  standalone: false,
})
export class TrainingCalendarVideoPage implements OnInit {
  // --- Services ---
  private trainingService = inject(TrainingCalendarsServiceService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  private activatedRoute = inject(ActivatedRoute);
  private storage = inject(StorageService);

  // --- Signals (State) ---
  public id = signal<string | null>(null);
  public group = signal<any>(null);
  public trainingCalendar = signal<any>(null);
  public show = signal(false);
  public file = signal<any>(null);
  public isUploading = signal(false);

  // --- FileReader instance ---
  private fileReader = new FileReader();

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.id.set(params['id'] ?? null);
    });

    // Setup file reader listener
    this.fileReader.onload = () => {
      // This is the base64 result
      console.log('File read complete');
    };
  }

  async ionViewWillEnter() {
    this.show.set(false);
    
    // REFACTORED: Loading Group from Native Storage (Async)
    const storedGroup = await this.storage.get(AuthConstants.GROUP);
    this.group.set(storedGroup);

    if (this.id() && this.group()) {
      const data = {
        team_group_training_calendar_id: this.id(),
        team_group_id: this.group().id,
      };

      this.trainingService.show(this.id()!, data).subscribe({
        next: (res) => {
          this.trainingCalendar.set(res.training_calendar);
          this.show.set(true);
        },
        error: (err) => {
          this.toastService.presentToast(this.translate.instant('error_loading_calendar'));
        }
      });
    }
  }

  onSingleFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.fileReader.readAsDataURL(files[0]);
    }
  }

  addMemberFile() {
    if (!this.fileReader.result) {
      this.toastService.presentToast(this.translate.instant('select_file_first'));
      return;
    }

    this.isUploading.set(true);

    const data = {
      media: this.fileReader.result,
      team_group_training_calendar_id: this.trainingCalendar().id,
      team_group_id: this.group().id,
    };

    this.trainingService.addMemberMonthlyMedia(data).subscribe({
      next: () => {
        this.file.set(null);
        this.isUploading.set(false);
        this.toastService.presentToast(this.translate.instant('file_added'));
      },
      error: (err) => {
        this.isUploading.set(false);
        this.toastService.presentToast(err?.error?.message || 'Upload failed');
      }
    });
  }
}