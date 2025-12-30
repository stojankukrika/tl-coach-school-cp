import { TestBed } from '@angular/core/testing';

import { GroupTrainerService } from './group-trainers.service';

describe('GroupTrainerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GroupTrainerService = TestBed.get(GroupTrainerService);
    expect(service).toBeTruthy();
  });
});
