import { TestBed } from '@angular/core/testing';

import { TrainingComingService } from './training-coming.service';

describe('TrainingComingService', () => {
  let service: TrainingComingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingComingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
