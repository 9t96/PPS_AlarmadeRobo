import { TestBed } from '@angular/core/testing';

import { AudioManagerService } from './audio-manager.service';

describe('AudioManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AudioManagerService = TestBed.get(AudioManagerService);
    expect(service).toBeTruthy();
  });
});
