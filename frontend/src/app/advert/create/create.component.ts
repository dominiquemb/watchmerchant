import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { AdvertService } from '../../advert.service';

@Component({
  selector: 'create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  advertCreationForm: FormGroup;
  activeForm: string = 'watchDetails';
  advertPreview;

  constructor(private _advert: AdvertService) { }

  ngOnInit() {
    let formGroup = {};
    const formControls = [
      'brand', 'model', 'manufacturerRef', 'year', 'price', 'isNew', 'caseMaterial', 'caseDiameter', 'dialColour',
      'strap', 'box', 'papers', 'gemstones', 'movement', 'gender', 'type', 'conditionRating', 'serviced', 'warranty',
      'description', 'picture1', 'picture2', 'picture3', 'picture4', 'picture5', 'picture6', 'picture7', 'picture8', 
      'picture9', 'picture10'
    ];
    formControls.forEach((field) => {
      formGroup[field] = new FormControl();
    });
    this.advertCreationForm = new FormGroup(formGroup);
  }

  showWatchDetailsForm() {
    this.activeForm = 'watchDetails';
  }

  showPicturesForm() {
    this.activeForm = 'pictures';
  }

  showPreview() {
    this.activeForm = 'preview';
  }

  createAdvert() {
    const formJson = this.advertCreationForm.getRawValue();
    this._advert.create(formJson).subscribe();
  }


}
