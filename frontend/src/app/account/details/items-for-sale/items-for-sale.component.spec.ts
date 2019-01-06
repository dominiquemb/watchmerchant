import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsForSaleComponent } from './items-for-sale.component';

describe('ItemsForSaleComponent', () => {
  let component: ItemsForSaleComponent;
  let fixture: ComponentFixture<ItemsForSaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemsForSaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsForSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
