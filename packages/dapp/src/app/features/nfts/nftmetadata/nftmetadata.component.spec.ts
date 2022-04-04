import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NFTMetadataComponent } from './nftmetadata.component';

describe('NFTmetadataComponent', () => {
  let component: NFTMetadataComponent;
  let fixture: ComponentFixture<NFTMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NFTMetadataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NFTMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
