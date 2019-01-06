import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxStripeModule } from 'ngx-stripe';

import { environment } from '../../environments/environment';

import { AccountDetailsComponent } from './account-details/account-details.component';
import { AccountHomeComponent } from './account-home/account-home.component';
import { AddressComponent } from './details/address/address.component';
import { CreateTradeAccountComponent } from './creation/create-trade-account/create-trade-account.component';
import { LoginComponent } from './login/login.component';
import { PackagesComponent } from './details/packages/packages.component';
import { PaymentComponent } from './details/payment/payment.component';
import { CreatePaymentMethodComponent } from './details/create-payment-method/create-payment-method.component';
import { MyAdvertsComponent } from './my-adverts/my-adverts.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CompanyInfoComponent } from './details/company-info/company-info.component';
import { CreateAccountTypeComponent } from './creation/create-account-type/create-account-type.component';
import { ItemsForSaleComponent } from './details/items-for-sale/items-for-sale.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgxStripeModule.forRoot(environment.stripe)
  ],
  declarations: [
    AccountHomeComponent,
    AccountDetailsComponent,
    AddressComponent,
    CreateTradeAccountComponent,
    LoginComponent,
    PackagesComponent,
    PaymentComponent,
    CreatePaymentMethodComponent,
    MyAdvertsComponent,
    ResetPasswordComponent,
    CompanyInfoComponent,
    CreateAccountTypeComponent,
    ItemsForSaleComponent
  ]
})
export class AccountModule { }
