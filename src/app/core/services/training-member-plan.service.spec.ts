import { TestBed } from '@angular/core/testing';

import { TrainingMemberPlanService } from './training-member-plan.service';

describe('TrainingMemberPlanService', () => {
  let service: TrainingMemberPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingMemberPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
