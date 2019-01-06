import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { FlashService } from './flash.service';
import { UserService } from './user.service';

@Injectable()
export class RequireLoginGuard implements CanActivate {

  constructor(private _flash: FlashService, private _router: Router, private _user: UserService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // return this._user.isLoggedIn().map(value => {
    //   const result: boolean = !!value;
    //   if (!result) {
    //     this._flash.send('You must be logged in to access that page', 'alert-info');
    //     this._router.navigate(['/login']);
    //   }
    //   return result;
    // });
    const loggedIn = this._user.isLoggedIn();
    if (loggedIn) {
      return true;
    } else {
      this._flash.send('You must be logged in to access that page', 'alert-info');
      this._router.navigate(['/login']);
    }
  }
}
