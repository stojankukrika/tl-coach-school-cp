import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainingCalendarResultPage } from './training-calendar-result.page';

describe('TrainingCalendarResultPage', () => {
  let component: TrainingCalendarResultPage;
  let fixture: ComponentFixture<TrainingCalendarResultPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingCalendarResultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
