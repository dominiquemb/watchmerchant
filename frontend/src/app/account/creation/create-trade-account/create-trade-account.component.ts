import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgModel } from '@angular/forms';

import { FlashService } from '../../../flash.service';
import { UserService } from '../../../user.service';

@Component({
  selector: 'create-trade-account',
  templateUrl: './create-trade-account.component.html',
  styleUrls: ['./create-trade-account.component.scss'],
  providers: [UserService]
})
export class CreateTradeAccountComponent implements OnInit {

  email: string;
  password: string;
  companyName: string;
  companyReg: string;
  postCode: string;
  passwordConfirmation: string;
  registrationComplete: boolean;

  constructor(private _flash: FlashService, private titleService: Title, private _user: UserService) { }

  ngOnInit() {
    this.titleService.setTitle('Create Trade Account | Watch Merchant UK')
  }

  register() {
    if (this.password !== this.passwordConfirmation) {
      this._flash.send('Your password and password confirmation entries must match!', 'alert-danger')
      return;
    }
    this._user.create({
      companyName: this.companyName,
      companyReg: this.companyReg,
      email: this.email,
      password: this.password,
      postCode: this.postCode
    }).subscribe(
      response => {
        this.registrationComplete = true;
      });
  }

}
