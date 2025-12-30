import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainingCalendarVideoPage } from './training-calendar-video.page';

describe('TrainingCalendarVideoPage', () => {
  let component: TrainingCalendarVideoPage;
  let fixture: ComponentFixture<TrainingCalendarVideoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingCalendarVideoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
