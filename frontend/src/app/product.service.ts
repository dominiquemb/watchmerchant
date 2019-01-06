import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';

@Injectable()
export class ProductService {
  apiRoot: string = environment.apiRoot;

  constructor(private _http: HttpClient) { }

  getBrandList() {
    return this._http.get<any>(`${this.apiRoot}/search/brands`);
  }

  getProductsForBrand(brandId: number) {
    return this._http.get<any>(`${this.apiRoot}/search/products/?brandId=${brandId}`);
  }

}
