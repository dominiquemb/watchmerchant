import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { filters, setupBrands, setupProducts, applyFilters, resetFilters } from './filters'
import { AdvertService } from '../../advert.service';
import { FlashService } from '../../flash.service';
import { ProductService } from '../../product.service';

import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [ProductService]
})
export class SearchComponent implements OnInit {
  @Input() universalSearchTerm: string;
  private _params: Subject<any> = new Subject<any>();
  resultsFilters = filters;
  searchResults: any[];
  displayedResults: any[];  
  sortBy: string;

  brand: number; // brand id
  brandName: string; // brand name
  model: string;
  year: number;
  price: number;
  condition: string;
  postCode: string = '';
  box: number;
  papers: boolean;
  rating: number;
  serviced: boolean;
  minWarranty: number;
  modelNumber: string;
  caseMaterial: string;
  caseDiameter: number;
  dialColour: string;
  strapMaterial: string;
  gemstones: boolean;
  movement: string;
  gender: string;
  seller: number;
  maxDistance: number;

  distanceOptions: number[] = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100, 200]

  showAdvancedSearch: boolean = false;

  brandList: any[] = [];
  productList: any[] = [];
  selectedBrand: number;

  dataLoaded: boolean; // True = results loaded. False = results requested, not yet loaded. Undefined = not yet requested.

  constructor(private _advert: AdvertService, private _flash: FlashService, private _product: ProductService, private _route: ActivatedRoute) { }

  ngOnInit() {
    if (this.universalSearchTerm) {
      this._params.next({
        universalSearchTerm: this.universalSearchTerm
      });
    } else {
    }
    this._params.subscribe(
      params => {
        this._advert.search(params).subscribe(
          results => {
            this.searchResults = this.filterResults(results);
            this.displayedResults = this.searchResults;
            setupProducts(this.displayedResults);
            this.dataLoaded = true;
          },
          error => {
            console.error(error);
          }
        )
      }
    )
    
    this._route.params.subscribe(
      params => {
        if (params.field && params.value) {
          this[params.field] = params.value;
          this.search();
        } else if (params.universalSearchTerm) {
          this._advert.search({ searchString: params.universalSearchTerm }, true).subscribe(
            results => {
              this.searchResults = this.filterResults(results);
              this.displayedResults = this.searchResults;
              setupProducts(this.displayedResults);              
              this.dataLoaded = true;
            }
          )

        }
      }
    )
    if (localStorage.getItem('postCode')) {
      this.postCode = localStorage.getItem('postCode');
    }
    this._product.getBrandList().subscribe(
      response => {
        this.brandList = response.data.brands.map(brand => {
          return { id: brand.id, name: brand.name };
        });
        setupBrands(response.data.brands)
      }
    );
    // this.searchResults = this._params.asObservable()
    //   .mergeMap(params => this._advert.search(params));
    

  }

  filterResults(results: any[]): any[] {
    return results.filter(ad => {
      if (this.maxDistance !== undefined && this.maxDistance !== 0) {
        return ad.roundedDistance <= this.maxDistance;
      } else {
        return true;
      }
    })
  }
  
  localFilterResults(filter: any, option: any) {
    filter.active = true
    filter.value = option
    this.displayedResults = applyFilters(this.searchResults)
  }

  populateModelList(selectedBrand: number) {    
    this._product.getProductsForBrand(selectedBrand)
      .subscribe(response => {
        this.brandName = this.brandList.find(brand => {
          return brand.id == selectedBrand;
        }).name;
        this.productList = response.data.products;
      })
  }

  search() {
    localStorage.setItem('postCode', this.postCode);
    const searchParams = {
      brandId: this.brand,
      model: this.model,
      year: Number(this.year),
      priceMax: this.price * 100,
      condition: this.condition,
      postCode: this.postCode,
      box: this.box,
      papers: this.papers,
      rating: this.rating,
      serviced: this.serviced,
      minWarranty: this.minWarranty,
      modelNumber: this.modelNumber,
      caseMaterial: this.caseMaterial,
      caseDiameter: this.caseDiameter,
      dialColour: this.dialColour,
      strapMaterial: this.strapMaterial,
      gemstones: this.gemstones,
      movement: this.movement,
      gender: this.gender
    };
    for (let key in searchParams) {
      if (!searchParams[key]) {
        delete searchParams[key];
      }
    }
    if (!Object.keys(searchParams).length) {
      this._flash.send('You must enter at least one search parameter', 'alert-danger');
    } else {
      console.log('Search parameters', searchParams)
      resetFilters()
      this.dataLoaded = false;
      this._params.next(searchParams);
    }
  }

  sortResults(sortStr: string) {
    const sortFunction = (a, b) => {
      switch (sortStr) {

        case 'price-lowest':
        if (a.price < b.price) { 
          return -1;
        } else if (b.price < a.price) {
          return 1;
        } else {
          return 0;
        }

        case 'price-highest':
        if (a.price < b.price) {
          return 1;
        } else if (b.price < a.price) {
          return -1;
        } else {
          return 0;
        }

        case 'age-newest':
        if (a.product.year < b.product.year) {
          return -1;
        } else if (b.product.year < a.product.year) {
          return 1;
        } else {
          return 0;
        }

        case 'age-oldest':
        if (a.product.year < b.product.year) {
          return 1;
        } else if (b.product.year < a.product.year) {
          return -1;
        } else {
          return 0;
        }

        case 'distance':
        if (a.roundedDistance < b.roundedDistance) {
          return -1;
        } else if (b.roundedDistance < a.roundedDistance) {
          return 1;
        } else {
          return 0;
        }
        default:
        return 1;
      }
    }
    this.displayedResults = this.displayedResults.sort(sortFunction);
    // this.displayedResults = this.searchResults;
    console.log('Sorted by ', sortStr, ':', this.displayedResults);
  }

  // getFiltersForDisplay(): any[] {
  //   const filters = [
  //     { field: 'Brand', value: this.brandName },
  //     { field: 'Model', value: this.model },
  //     { field: 'Year', value: Number(this.year) },
  //     { field: 'Max. Price', value: this.price ? '£' + this.price.toLocaleString() : null },
  //     { field: 'Condition', value: this.condition },
  //     { field: 'Box', value: this.box ? 'Yes' : null },
  //     { field: 'Papers', value: this.papers ? 'Yes' : null },
  //     { field: 'Rating', value: this.rating },
  //     { field: 'Serviced', value: this.serviced },
  //     { field: 'Min. Warranty', value: this.minWarranty },
  //     { field: 'Model Number', value: this.modelNumber },
  //     { field: 'Case Material', value: this.caseMaterial },
  //     { field: 'Case Diameter', value: this.caseDiameter ? this.caseDiameter + 'mm' : null },
  //     { field: 'Dial Colour', value: this.dialColour },
  //     { field: 'Strap Material', value: this.strapMaterial },
  //     { field: 'Gemstones', value: this.gemstones ? 'Yes' : null },
  //     { field: 'Movement', value: this.movement },
  //     { field: 'Gender', value: this.gender }
  //   ];
  //   return filters.filter(f => {
  //     return f.value;
  //   });
  // }

}
