import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainingCalendarsPage } from './training-calendars.page';

describe('TrainingCalendarsPage', () => {
  let component: TrainingCalendarsPage;
  let fixture: ComponentFixture<TrainingCalendarsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingCalendarsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
