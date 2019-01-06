import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class FlashService {
  private _flash: Subject<any> = new Subject();

  constructor() {}

  send(message: string, type: string, error: boolean = false) {
    if (error) {
      this._flash.error({ message: message, type: 'alert-danger' });
    } else {
      this._flash.next({ message: message, type: type });
    }
  }

  getFlash(): Observable<any> {
    return this._flash.asObservable();
  }

}
