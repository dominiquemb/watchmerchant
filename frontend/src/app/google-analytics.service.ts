import { Injectable } from '@angular/core';

import { environment } from '../environments/environment';

@Injectable()
export class GoogleAnalyticsService {
  ga: any;

  constructor() {
    if (environment.googleAnalytics) {
      this.ga = (<any>window).ga;
    } else {
      this.ga = function(action: string, ...args){
        console.log('Intercepted Google Analytics communication:', action);
        console.log('Arguments:', args);
      };
    }
  }

  sendPageView(url: string) {
    this.ga('set', 'page', url);
    this.ga('send', 'pageview');
  }

  sendEvent(category: string, action: string, label?: string, value?: number) {
    this.ga('send', 'event', category, action, label, value);
  }

}
