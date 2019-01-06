import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { FlashService } from '../flash.service';
import { UserService } from '../user.service';

@Component({
  selector: 'footer-bar',
  templateUrl: './footer-bar.component.html',
  styleUrls: ['./footer-bar.component.scss'],
  providers: [UserService]
})
export class FooterBarComponent implements OnInit {
  newsletterSubscriptionEmail: string;

  constructor(private _flash: FlashService, private _user: UserService) { }

  ngOnInit() {
  }

  newsletterSignup() {
    if (!this.newsletterSubscriptionEmail) return;
    this._user.subscribeToNewsletter(this.newsletterSubscriptionEmail)
      .subscribe(
        response => {
          this._flash.send('You\'re subscribed! Welcome aboard!', 'alert-info')
        },
        error => {
          this._flash.send('Something went wrong there; you haven\'t been signed up. Please try again later!', null, true)
        }
      );
    this.newsletterSubscriptionEmail = undefined;
  }

}
