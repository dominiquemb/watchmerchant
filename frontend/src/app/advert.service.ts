import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import 'rxjs/add/operator/shareReplay';

import { environment } from '../environments/environment';

@Injectable()
export class AdvertService {
  apiRoot: string = environment.apiRoot;

  constructor(private _http: HttpClient) { }

  search(params, universal: boolean = false): Observable<any> {
    const queryString = new URLSearchParams();
    for (let key in params) {
      queryString.set(key, params[key]);
    }
    const rootUrl = universal ? `${this.apiRoot}/search/universal` : `${this.apiRoot}/search/results`;
    return this._http.get<any>(`${rootUrl}?${queryString.toString()}`)
      .map(response => {
        return response.data.adverts.map(ad => {
          ad.roundedDistance = Math.round((ad.distance / 1000) * 0.62137); // Convert to miles
          return ad;
        });
      });
  }

  get(id: number): Observable<any> {
    const queryString = new URLSearchParams();
    if (localStorage.getItem('postCode')) {
      queryString.set('postCode', localStorage.getItem('postCode'));
    }
    return this._http.get<any>(`${this.apiRoot}/listing/${id.toString()}?${queryString.toString()}`)
      .shareReplay();
  }

  create(data): Observable<any> {
    return this._http.post<any>(`${this.apiRoot}/listing/create`, data)
      .shareReplay();
  }

  getNewArrivals(): Observable<any> {
    return this._http.get<any>(`${this.apiRoot}/listing/newArrivals`)
      .shareReplay();
  }

  getOwnListings() {
    return this._http.get<any>(`${this.apiRoot}/listings/user`).shareReplay();
  }

  markAsSold(id: number) {
    return this._http.post(`${this.apiRoot}/listing/${id}/sold`, {}, {
      responseType: 'text' as 'text'
    }).shareReplay();
  }

}
