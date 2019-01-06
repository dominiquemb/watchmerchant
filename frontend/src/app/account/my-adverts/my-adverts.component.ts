import { Component, OnInit } from '@angular/core';
import { AdvertService } from '../../advert.service';
import { FlashService } from '../../flash.service';
import { ImportService } from '../../import.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'my-adverts',
  templateUrl: './my-adverts.component.html',
  styleUrls: ['./my-adverts.component.scss'],
  providers: [ImportService, UserService]
})
export class MyAdvertsComponent implements OnInit {
  user: any = {};
  ownListings: any[] = [];

  constructor(private _advert: AdvertService, private _flash: FlashService, private _import: ImportService, private _user: UserService) { }

  ngOnInit() {
    this._user.getDetails()
      .subscribe(response => {
        this.user = response.data.user;
      });
    this.getMyListings();
  }

  getMyListings() {
    this._advert.getOwnListings().subscribe(
      response => {
        response.data.adverts.forEach(advert => {
          if (advert.images.length === 0) {
            advert.images.push({
              url: '/assets/images/no-image.png'
            });
          } else {
            advert.images.forEach(image => {
              image.url = 'http://assets.watchmerchantuk.com/watches/' + image.url;
            });
          }
        })
        this.ownListings = response.data.adverts;
      });
  }

  markAsSold(advertId: number) {
    this._advert.markAsSold(advertId).subscribe(
      response => {
        this.getMyListings();
      }
    );
  }

  handleFileUpload(files: FileList) {
    this._flash.send('Your file is being uploaded ...', 'alert-info');
    const csv: File = files.item(0);
    this._import.uploadCSVManifest(csv)
      .subscribe(
        response => {
          this._flash.send('Your manifest has been uploaded successfully and will now be processed.', 'alert-info')
        },
        error => {
          this._flash.send('There was a problem processing your manifest. Please contact support for assistance!', 'alert-danger', true)
        }
      )
  }

}
