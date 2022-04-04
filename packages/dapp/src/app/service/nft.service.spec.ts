import { TestBed } from '@angular/core/testing';

import { NFTService } from './nft.service';

describe('NFTService', () => {
  let service: NFTService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NFTService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
