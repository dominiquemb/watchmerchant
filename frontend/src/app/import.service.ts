import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';

@Injectable()
export class ImportService {
  apiRoot: string = `${environment.apiRoot}/import`

  constructor(private _http: HttpClient) { }

  uploadCSVManifest(csv: File) {
    console.log('Importing', csv);
    const formData = new FormData();
    formData.append('advertImport', csv, csv.name);
    return this._http.post(`${this.apiRoot}/create`, formData);
  }

}
