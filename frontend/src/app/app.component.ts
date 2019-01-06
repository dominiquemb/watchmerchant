import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

import { environment } from '../environments/environment';

import { FlashService } from './flash.service';
import { GoogleAnalyticsService } from './google-analytics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [GoogleAnalyticsService]
})
export class AppComponent implements OnInit {
  flashMessage: any;
  isFullWidth: boolean;
  isFrontPage: boolean;
  isAbout: boolean;
  isServices: boolean;
  isSellMyWatch: boolean;
  production: boolean = environment.production;

  constructor(private _flash: FlashService, private _ga: GoogleAnalyticsService, private router: Router, private location: Location) {}

  ngOnInit() {
    console.log(`Running in ${this.production ? 'production' : 'non-production'} mode`)
    this.router.events.subscribe(e => {
      const path = this.location.path() ? this.location.path() : '/'; 
      this.isFullWidth = ['/', '/about', '/about/services', '/sell-my-watch'].includes(path);
      this.isFrontPage = path === '/';
      this.isAbout = path === '/about';
      this.isServices = path === '/about/services';
      this.isSellMyWatch = path === '/sell-my-watch';
      if (e instanceof NavigationEnd) {
        this._ga.sendPageView(e.urlAfterRedirects);
        window.scrollTo(0, 0);
        this.removeFlash();
      }
    });
    this._flash.getFlash().subscribe(
      message => {
        this.flashMessage = message;
      },
      error => {
        this.flashMessage = error;
      }
    );
  }
  removeFlash() {
    this.flashMessage = null;
  }
}
