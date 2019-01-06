import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/shareReplay';

import { environment } from '../environments/environment';

import { PaymentMethod as IPaymentMethod, PaymentMethod } from './payment-method';

@Injectable()
export class UserService {
  apiRoot: string = `${environment.apiRoot}/user`
  currentUser: BehaviorSubject<any> = new BehaviorSubject(false);

  constructor(private _http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this._http.post(`${this.apiRoot}/login`, { email: email, password: password })
      .do(response => {
        this.currentUser.next(true);
        this.setToken(response);
      })
      .shareReplay();
  }

  private setToken(loginResponse) {
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + loginResponse.expiresIn / 1000);
    localStorage.setItem('idToken', String(loginResponse.idToken));
    localStorage.setItem('expiresAt', String(expiry));
  }

  logout() {
    localStorage.removeItem('idToken');
    localStorage.removeItem('expiresAt');
    this.currentUser.next(false);
  }

  isLoggedIn() {
    let expiry = +new Date(localStorage.getItem('expiresAt'));
    console.log(localStorage.getItem('idToken'));
    console.log(localStorage.getItem('expiresAt'));
    if (localStorage.getItem('idToken') && expiry >= +new Date()) {
      this.currentUser.next(true);
      return true;
    } else {
      this.currentUser.next(false);
      return false;
    }
  }

  create(userData: any) {
    return this._http.post(`${this.apiRoot}/register`, userData).shareReplay();
  }

  getDetails() {
    return this._http.get<any>(`${this.apiRoot}`).shareReplay();
  }

  updateAddress(address: any) {
    return this._http.post<any>(`${this.apiRoot}/address`, { address: address }).shareReplay();
  }

  getAvailableProductsAndPlans() {
    return this._http.get<any>(`${this.apiRoot}/products`)
      .shareReplay();
  }

  getSubscriptions() {
    return this._http.get<any>(`${this.apiRoot}/subscriptions`)
      .shareReplay();
  }

  updateSubscriptions(subscriptions: any) {
    return this._http.post(`${this.apiRoot}/subscribe`, { subscriptions: subscriptions })
      .shareReplay();
  }

  createCard(token) {
    return this._http.post(`${this.apiRoot}/createCard`, { token: token })
      .shareReplay();
  }

  listCards() {
    return this._http.get<any>(`${this.apiRoot}/cards`)
      .shareReplay();
  }

  setDefaultCard(cardId: string) {
    return this._http.put<any>(`${this.apiRoot}/cards/setDefault`, { id: cardId })
      .shareReplay();
  }

  subscribeToNewsletter(email: string) {
    return this._http.post(`${this.apiRoot}/newsletter/subscribe`, { email: email }, {
      responseType: 'text' as 'text'
    })
      .shareReplay();
  }

  requestPasswordResetToken(email: string) {
    const queryString = new URLSearchParams();
    queryString.set('email', email);
    return this._http.get(
      `${this.apiRoot}/resetToken?${queryString.toString()}`,
      {
        responseType: 'text' as 'text'
      }).shareReplay();
  }

  requestAppointment(email: string, date: any) {
    return this._http.post(
      `${this.apiRoot}/requestAppointment`, { email: email, date: date }, {
        responseType: 'text' as 'text'
      }
    ).shareReplay()
  }

  updateCompanyInfo(details: any) {
    return this._http.post(
      `${this.apiRoot}/updateCompanyInfo`, { details: details }, {
        responseType: 'text' as 'text'
      }
    ).shareReplay();
  }
}
