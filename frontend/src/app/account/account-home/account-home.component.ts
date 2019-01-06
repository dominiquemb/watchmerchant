import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user.service';

@Component({
  selector: 'account-home',
  templateUrl: './account-home.component.html',
  styleUrls: ['./account-home.component.scss']
})
export class AccountHomeComponent implements OnInit {
  user: any = {};

  constructor(private _user: UserService) { }

  ngOnInit() {
    this._user.getDetails()
      .subscribe(response => {
        this.user = response.data.user;
      });
  }

}
