import { Component, OnInit } from '@angular/core';

import { FlashService } from '../../../flash.service';
import { UserService } from '../../../user.service';

@Component({
  selector: 'address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  providers: [UserService]
})
export class AddressComponent implements OnInit {
  companyName: string;
  companyReg: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  county: string;
  postCode: string;
  
  constructor(private _flash: FlashService, private _user: UserService) { }

  ngOnInit() {
    this._user.getDetails().subscribe(
      response => {
        const user = response.data.user;
        this.email = user.email;
        this.companyName = user.sellerName;
        this.companyReg = user.sellerCompanyReg;
        this.addressLine1 = user.addressLine1;
        this.addressLine2 = user.addressLine2;
        this.city = user.city;
        this.county = user.county;
        this.postCode = user.postCode;
      }
    )
  }

  updateAddress() {
    const address = {
      companyName: this.companyName,
      companyReg: this.companyReg,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      city: this.city,
      county: this.county,
      postCode: this.postCode
    };
    this._user.updateAddress(address).subscribe(
      response => {
        this._flash.send('Your details have been updated.', 'alert-info');
      },
      error => {
        console.error(error);
        this._flash.send('There was a problem updating your details. Please try again or contact support.', 'alert-danger');
      }
    )
  }

}
