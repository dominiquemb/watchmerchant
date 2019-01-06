import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';

import { FlashService } from '../../flash.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;
  error: string;

  constructor(private _flash: FlashService, private _router: Router, private _user: UserService) { }

  ngOnInit() {
  }

  login() {
    this._user.login(this.email, this.password)
      .subscribe(
        data => {
         this._router.navigate(['/account']);
        },
        error => {
          let msg: string;
          switch(error.status) {
            case 400:
            msg = 'You must supply both an e-mail address and password';
            break;
            case 401:
            msg = 'That e-mail address and password combination wasn\'t recognised.';
            break;
            default:
            msg = 'Something went wrong with your login attempt. Please try again.';
          }
          this._flash.send(msg, 'alert-danger');
        }
      )
  }

}
