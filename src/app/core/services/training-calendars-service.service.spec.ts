import { TestBed } from '@angular/core/testing';

import { TrainingCalendarsServiceService } from './training-calendars-service.service';

describe('TrainingCalendarsServiceService', () => {
  let service: TrainingCalendarsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingCalendarsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
