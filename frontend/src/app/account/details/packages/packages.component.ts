import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Package } from '../../../package';
import { FlashService } from '../../../flash.service';
import { UserService } from '../../../user.service';

@Component({
  selector: 'packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss']
})
export class PackagesComponent implements OnInit {
  packages: Package[];
  subscriptions: any[];
  dataLoaded: boolean = false;
  terms: boolean = false;

  constructor(private _flash: FlashService, private _router: Router, private _user: UserService) { }

  ngOnInit() {
    this._user.listCards()
      .subscribe(
        response => {
          if (response.data.cards && response.data.cards.length) {
            this.getSubscriptions();
          } else {
            this._router.navigate(['/account/details/payment']);
            this._flash.send('You must set up a payment method before selecting a package.', 'alert-info');
          }
        });
  }

  getSubscriptions() {
    this._user.getSubscriptions()
      .subscribe(response => {
        this.subscriptions = response.data.subs;
        this._user.getAvailableProductsAndPlans()
          .subscribe(response => {
            this.dataLoaded = true;
            this.packages = response.data.products.filter(p => {
              return p.type === 'service' && p.plans.length;
            }).map(product => {
              let p: Package = <Package>{
                friendlyName: product.name,
                description: product.metadata.description,
                id: product.id,
                options: product.plans.map(plan => {
                  return {
                    id: plan.id,
                    amount: plan.amount,
                    interval: plan.interval,
                    name: plan.nickname,
                    subscribed: this.subscriptions.some(sub => {
                      return sub.plan.id === plan.id
                    })
                  };
                })
              };
              return p;
            });
          });

      });
  }

  updateSubscriptions() {
    const subData = this.packages.map(pkg => {
      const planId = pkg.options.find(opt => {
        return opt.subscribed
      });
      return {
        productId: pkg.id,
        planId: planId && planId.id ? planId.id : null
      }
    });
    this._user.updateSubscriptions(subData)
      .subscribe(
        response => {
          this.getSubscriptions();
        },
        error => {
          console.error(error);
        }
      )
  }

  subscribeToProductAndPlan(productId: string, planId: string) {
    const pkg = this.packages.filter(p => {
      return p.id === productId;
    })[0];
    pkg.options.forEach(plan => {
      if (plan.id === planId) {
        plan.subscribed = true;
      } else {
        plan.subscribed = false;
      }
    });
    // this.updateSubscriptions();
  }

}