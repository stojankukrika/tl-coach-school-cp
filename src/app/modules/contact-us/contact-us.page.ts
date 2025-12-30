import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ContactService } from 'src/app/core/services/contact.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
  standalone: false
})
export class ContactUsPage implements OnInit {
  // --- Dependency Injection ---
  private contactService = inject(ContactService);
  private navCtrl = inject(NavController);
  private toastService = inject(ToastService);

  // --- State Signals ---
  readonly show = signal(false);
  readonly clicked = signal(false);
  readonly contactUs = signal({ message: "" });

  // --- Computed Signals ---
  /** Automatically validates the form */
  readonly isInputValid = computed(() => {
    const msg = this.contactUs().message;
    return msg && msg.trim().length > 0;
  });

  ngOnInit() {
    // Artificial delay to show skeleton if desired, or set true immediately
    setTimeout(() => this.show.set(true), 500);
  }

  /** Helper to update signal object without direct mutation */
  updateMessage(val: any) {
    this.contactUs.update(current => ({ ...current, message: val }));
  }

  submitContact() {
    if (this.isInputValid()) {
      this.clicked.set(true);
      
      this.contactService.contactUs(this.contactUs()).pipe(
        finalize(() => this.clicked.set(false))
      ).subscribe({
        next: () => {
          this.navCtrl.navigateRoot(['./home']);
        },
        error: () => {
          this.toastService.presentToast('Some error happened!');
        }
      });
    }
  }
}