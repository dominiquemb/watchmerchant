import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'items-for-sale',
  templateUrl: './items-for-sale.component.html',
  styleUrls: ['./items-for-sale.component.scss']
})
export class ItemsForSaleComponent implements OnInit {
  inventoryFlag:boolean = false;
  inventory:any = [];

  constructor() { }

  ngOnInit() {
  }
}
