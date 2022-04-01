import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NFTComponent } from './nft.component';

describe('NFTComponent', () => {
  let component: NFTComponent;
  let fixture: ComponentFixture<NFTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NFTComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NFTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
