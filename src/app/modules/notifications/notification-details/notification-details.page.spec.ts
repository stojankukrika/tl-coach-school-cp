import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationDetailsPage } from './notification-details.page';

describe('NotificationDetailsPage', () => {
  let component: NotificationDetailsPage;
  let fixture: ComponentFixture<NotificationDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
