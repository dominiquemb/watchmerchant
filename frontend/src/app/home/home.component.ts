import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AdvertService } from '../advert.service';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [AdvertService]
})
export class HomeComponent implements OnInit {
  newArrivals: any[];
  reasons: any[];
  brandLogos: any[];

  constructor(private _advert: AdvertService, private _router: Router, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle('Watch Merchant UK');
    this.reasons = [
      { header: 'Listing Adverts', text: 'Extremely cost effective with many options to choose, from Pay as you List to more feature rich Bundle Deals and Exclusive Offers.', imageUrl: '/assets/images/services/checklist.png' },
      { header: 'Search fast', text: 'Our built-in catalogue helps you search and filter for items fast, which ensures buyers watches are found as quickly as possible.', imageUrl: '/assets/images/services/speedometer.png' },
      { header: 'Deal with experts', text: 'Our online guides will help you at every step of the buying or selling process, providing you with advice on everything from servicing a watch to spotting a fake.', imageUrl: '/assets/images/services/tick.png' },
      { header: 'Broker Service', text: 'Choose your item based on the specifications and features needed and receive offers direct from dealers at their best price.', imageUrl: '/assets/images/services/pound.png' },
      { header: 'VIP Appointment Booking', text: 'An additional feature for sellers who want to add that extra air of luxury to a sale and go the extra mile for their customers, all without leaving the site.', imageUrl: '/assets/images/services/star.png' },
      { header: 'Low Cost', text: 'Prices start from as little as 25p per day!', imageUrl: '/assets/images/services/piggybank.png' },
      { header: 'You in control', text: 'Decide whether you\'d prefer the personal approach and try out the item in store or simply pay for and arrange delivery, it\'s up to you.', imageUrl: '/assets/images/services/control.png' },
      { header: 'Trusted Dealers', text: 'A personal touch goes a long way and we give you the opportunity to search thousands of watches and decide which you’d like to view with the seller of your choice.', imageUrl: '/assets/images/services/handshake.png' },
      { header: 'Try it out', text: 'At Watch Merchant UK, we strive to provide the opportunity to provide our services before you commit.', imageUrl: '/assets/images/services/free.png' }
    ];
    this.brandLogos = [
      { url: '/assets/images/brands/cartier.png', name: 'Cartier' },
      { url: '/assets/images/brands/chopard.png', name: 'Chopard Geneveve' },
      { url: '/assets/images/brands/audemars-piguet.png', name: 'Audemars Piguet' },
      { url: '/assets/images/brands/hublot.png', name: 'Hublot' },
      { url: '/assets/images/brands/patek-philippe.png', name: 'Patek Philippe' },
      { url: '/assets/images/brands/rolex.png', name: 'Rolex' },
    ];
    this._advert.getNewArrivals().subscribe(
      response => {
        this.newArrivals = response.data.newArrivals;
      }
    );
  }

  gotoSearch() {
    this._router.navigate(['/search']);
  }
}
