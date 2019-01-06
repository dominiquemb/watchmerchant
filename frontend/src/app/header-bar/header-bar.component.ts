import { Component, OnInit, Input } from '@angular/core';
import { NgModel } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router';

import { ProductService } from '../product.service';
import { UserService } from '../user.service';

@Component({
  selector: 'header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.scss']
})
export class HeaderBarComponent implements OnInit {
  @Input() isFrontPage: boolean;
  @Input() showSellMyWatch: boolean = true;
  loggedIn: boolean = false;
  mobileNavDisplayed = false;
  searchString: string;
  showBrandsPopup: boolean = false;
  brandColumns: any[] = [];
  brands: any[] = [];
  links = [
    { text: 'About Us', url: '/about' },
    { text: 'Services', url: '/about/services' },
    { text: 'Prices', url: '/about/prices' }
  ]

  constructor(private _product: ProductService, private _route: ActivatedRoute, private _router: Router, private _user: UserService) { }

  ngOnInit() {
    // this.loggedIn = this._user.isLoggedIn();
    this._user.currentUser.subscribe(
      response => {
        this.loggedIn = response;
      }
    );

/*
    this._route.url.subscribe(
      response => {
        console.log(response);
      }
    )
*/
    this.brandColumns = [
	[
		{'name': 'Rolex'},
		{'name': 'Vacheron Constantin'},
		{'name': 'Omega'},
		{'name': 'Audemars Piguet'},
		{'name': 'IWC'},
		{'name': 'Montblanc'},
		{'name': 'Breitling'},
		{'name': 'A. Lange & Sohne'},
		{'name': 'Hublot'},
		{'name': 'Roger Dubuis'},
	],
	[
		{'name': 'Cartier'},
		{'name': 'Jaeger-LeCoultre'},
		{'name': 'Chopard'},
		{'name': 'Ulysse Nardin'},
		{'name': 'Chanel'},
		{'name': 'Blancpain'},
		{'name': 'Bell & Ross'},
		{'name': 'Patek Philippe'},
		{'name': 'Panerai'},
		{'name': 'Manufacture Royale'}
    	]
    ];
  }

  triggerBrandsPopup() {
    this.showBrandsPopup = true;
  }

  hideBrandsPopup() {
    this.showBrandsPopup = false;
  }

  doSearch() {
    // console.log(this.searchString);
    this._router.navigate(['/search/' + this.searchString]);
  }

  showMobileNav() {
    this.mobileNavDisplayed = !this.mobileNavDisplayed;
  }

  logout() {
    this._user.logout();
  }

}
