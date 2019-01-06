import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';

import { FlashService } from '../../flash.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  email: string;
  token: string;
  resetRequestComplete: boolean = false;

  constructor(private _flash: FlashService, private _user: UserService) { }

  ngOnInit() {
  }

  requestPasswordResetToken() {
    this._user.requestPasswordResetToken(this.email).subscribe(
      response => {
        this.resetRequestComplete = true;
      }
    )
  }

}
