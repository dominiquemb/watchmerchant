import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTradeAccountComponent } from './create-trade-account.component';

describe('CreateTradeAccountComponent', () => {
  let component: CreateTradeAccountComponent;
  let fixture: ComponentFixture<CreateTradeAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTradeAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTradeAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
