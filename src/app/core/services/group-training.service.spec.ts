import { TestBed } from '@angular/core/testing';

import { GroupTrainingService } from './group-training.service';

describe('GroupTrainingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GroupTrainingService = TestBed.get(GroupTrainingService);
    expect(service).toBeTruthy();
  });
});
