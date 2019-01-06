import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { PaymentMethod as IPaymentMethod } from '../../../payment-method';
import { UserService } from '../../../user.service';

@Component({
  selector: 'payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  providers: [UserService]
})
export class PaymentComponent implements OnInit {
  paymentMethods: IPaymentMethod[];
  dataLoaded: boolean = false;

  constructor(private _router: Router, private _user: UserService) { }

  ngOnInit() {
    this._user.listCards()
      .subscribe(
        response => {
          this.dataLoaded = true;
          this.paymentMethods = response.data.cards;
        }
      )
  }

  loadPaymentMethodCreation() {
    this._router.navigate(['/account/details/payment/create']);
  }

  getCardImage(brand:string) {
    brand = brand.toLowerCase();
    if (brand == "visa") {
	return "/assets/images/visa-logo.png";
    }
    if (brand == "mastercard") {
	return "/assets/images/mastercard-logo.png";
    }
    if (brand == "american express") {
	return "/assets/images/amex-logo.png";
    }
  }

}
