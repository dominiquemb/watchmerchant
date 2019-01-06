import { Component, OnInit } from '@angular/core';

import { FlashService } from '../../../flash.service';
import { UserService } from '../../../user.service';

@Component({
  selector: 'company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss']
})
export class CompanyInfoComponent implements OnInit {
  companySummary:string = "";
  finance: boolean;

  constructor(private _flash: FlashService, private _user: UserService) { }

  ngOnInit() {
  }

  update() {
    const details = {
      summary: this.companySummary,
      finance: this.finance
    }
    console.log(details);
    this._user.updateCompanyInfo(details).subscribe(
      response => {
        this._flash.send('Your information has been updated.', 'alert-info');
      }
    )
  }

}
