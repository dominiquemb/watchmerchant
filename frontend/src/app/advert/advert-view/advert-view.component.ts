import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { AdvertService } from '../../advert.service';
import { FlashService } from '../../flash.service';
import { UserService } from '../../user.service';
import { GoogleAnalyticsService } from '../../google-analytics.service';


@Component({
  selector: 'advert-view',
  templateUrl: './advert-view.component.html',
  styleUrls: ['./advert-view.component.scss'],
  providers: [GoogleAnalyticsService]
})
export class AdvertViewComponent implements OnInit {
  @Input() advert: any;
  product: any;
  seller: any;
  distanceToSeller: number;
  displaySellerDetails: boolean = false;
  displayContactDetails: boolean = false;
  modalImage: string;
  fallbackImageUrl: string = '/assets/images/no-image.png';
  userPostCode: string = localStorage.getItem('postCode');
  vipDate: NgbDateStruct;
  vipEmail: string;

  constructor(private _advert: AdvertService, private _flash: FlashService, private _ga: GoogleAnalyticsService, private _route: ActivatedRoute, private _router: Router, private _user: UserService) { }

  ngOnInit() {
    this._route.params.subscribe(
      params => {
        if (!this.advert) {
          this.advert = this._advert.get(params.id).subscribe(
            response => {
              this.advert = response.data.advert;
              this.product = response.data.product;
              this.seller = response.data.seller;
              this.distanceToSeller = Math.round(this.advert.distance / 1000);
              this._ga.sendEvent('Advert', 'View', this.getSKU());
            },
            error => {
              this.handleError(error);
            }
          );
        }
      }
    );
  }

  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error(`An error occurred in loading the advert: ${error.error.message}`);
    } else {
      console.error(`An error occurred in loading the advert. The server returned a ${error.status} (${error.statusText}).`);
    }
    this._router.navigate(['/advert-not-found']);
  }

  getSKU(): string {
    if (!this.advert) {
      return;
    }
    let sku: string = String(this.advert.id);
    while (sku.length < 6) {
      sku = '0' + sku;
    }
    return 'WMUK_' + sku;
  }

  showSellerDetails(element) {
    this.displaySellerDetails = true;
    element.scrollIntoView();
    this._ga.sendEvent('Advert', 'Show Seller Details', this.getSKU());
  }

  contactSeller() {
    this.displayContactDetails = true;
    this._ga.sendEvent('Advert', 'Contact Seller', this.getSKU());
  }

  setModalImage(url: string) {
    this.modalImage = url;
  }

  clearModalImage() {
    this.modalImage = null;
  }

  requestAppointment() {
    this._user.requestAppointment(this.vipEmail, this.vipDate).subscribe(
      response => {
        this._flash.send('Your request has been sent to the dealer.', 'alert-info');
      }
    )
  }

}
