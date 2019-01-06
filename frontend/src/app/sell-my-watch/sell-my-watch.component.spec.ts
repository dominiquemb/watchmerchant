import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SellMyWatchComponent } from './sell-my-watch.component';

describe('SellMyWatchComponent', () => {
  let component: SellMyWatchComponent;
  let fixture: ComponentFixture<SellMyWatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellMyWatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellMyWatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
