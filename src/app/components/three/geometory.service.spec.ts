import { TestBed } from '@angular/core/testing';

import { GeometoryService } from './geometory.service';

describe('GeometoryService', () => {
  let service: GeometoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeometoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
