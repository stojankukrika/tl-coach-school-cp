import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainingPlanPage } from './training-plan.page';

describe('TrainingPlanPage', () => {
  let component: TrainingPlanPage;
  let fixture: ComponentFixture<TrainingPlanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingPlanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
