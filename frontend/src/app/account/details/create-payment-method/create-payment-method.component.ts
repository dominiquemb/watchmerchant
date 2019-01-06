import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { StripeService, Element, Elements, Token } from 'ngx-stripe';

import { UserService } from '../../../user.service';

@Component({
  selector: 'create-payment-method',
  templateUrl: './create-payment-method.component.html',
  styleUrls: ['./create-payment-method.component.scss'],
  providers: [StripeService]
})
export class CreatePaymentMethodComponent implements OnInit {
  cardOwnerName: string;
  token: Token;

  card: Element;
  elements: Elements;

  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'  
  ];

  years = [
    2018,
    2019,
    2020,
    2021,
    2022,
    2023,
    2024,
    2025,
    2026,
    2027,
    2828
  ]
  constructor(private _stripe: StripeService, private _router: Router, private _user: UserService) { }

  ngOnInit() {
    this._stripe.elements()
      .subscribe(elements => {
        this.card = elements.create('card', {
          style: {
            base: {
              fontFamily: '"Montserrat", sans-serif'
            }
          }
        });
        this.card.mount('#card-element');
      })
  }

  createCard() {
    this._stripe.createToken(this.card, { name: this.cardOwnerName })
      .subscribe(
        data => {
          this.token = data.token;
          this._user.createCard(this.token)
            .subscribe(data => {
              this._router.navigate(['/account/details/payment']);
            })
        }
      )
  }

}
