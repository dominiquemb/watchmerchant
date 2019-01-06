import { Routes } from '@angular/router';

import { RequireLoginGuard } from './require-login.guard';

// App
import { AppComponent } from './app.component';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { HomeComponent } from './home/home.component';
import { HelpComponent } from './help/help.component';
import { AboutComponent } from './about/about.component';
import { ServicesComponent } from './services/services.component';
import { SellMyWatchComponent } from './sell-my-watch/sell-my-watch.component';

// Account
import { CreateAccountTypeComponent } from './account/creation/create-account-type/create-account-type.component';
import { CreateTradeAccountComponent } from './account/creation/create-trade-account/create-trade-account.component';
import { FooterBarComponent } from './footer-bar/footer-bar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AccountHomeComponent } from './account/account-home/account-home.component';
import { AccountDetailsComponent } from './account/account-details/account-details.component';
import { AddressComponent as AccountAddressComponent } from './account/details/address/address.component';
import { PackagesComponent as AccountPackagesComponent } from './account/details/packages/packages.component';
import { PaymentComponent as AccountPaymentComponent } from './account/details/payment/payment.component';
import { CreatePaymentMethodComponent } from './account/details/create-payment-method/create-payment-method.component';
import { LoginComponent } from './account/login/login.component';
import { MyAdvertsComponent } from './account/my-adverts/my-adverts.component';
import { CompanyInfoComponent } from './account/details/company-info/company-info.component';
import { ItemsForSaleComponent } from './account/details/items-for-sale/items-for-sale.component';

// Advert
import { AdvertViewComponent } from './advert/advert-view/advert-view.component';
import { CreateComponent as AdvertCreateComponent } from './advert/create/create.component';
import { SearchComponent } from './advert/search/search.component';
import { SearchResultsComponent } from './advert/search-results/search-results.component';
import { ResetPasswordComponent } from './account/reset-password/reset-password.component';

// Broker
import { SimpleComponent as BrokerSimpleComponent } from './broker/simple/simple.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },

    // Redirects
//    { path: 'signup', redirectTo: '/account/create/trade' },
    { path: 'signup', redirectTo: '/account/create' },
    { path: 'login', redirectTo: '/account/login' },

    { path: 'about', component: AboutComponent },
    { path: 'about/services', component: ServicesComponent },

    // Account
    { path: 'account', component: AccountHomeComponent, canActivate: [RequireLoginGuard] },       
    { path: 'account/details', component: AccountDetailsComponent, canActivate: [RequireLoginGuard]  },
    { path: 'account/details/address', component: AccountAddressComponent, canActivate: [RequireLoginGuard]  },
    { path: 'account/details/packages', component: AccountPackagesComponent, canActivate: [RequireLoginGuard]  },
    { path: 'account/details/payment', component: AccountPaymentComponent, canActivate: [RequireLoginGuard]  },
    { path: 'account/details/payment/create', component: CreatePaymentMethodComponent, canActivate: [RequireLoginGuard] },
    { path: 'account/details/company-info', component: CompanyInfoComponent, canActivate: [RequireLoginGuard] },
    { path: 'account/details/items-for-sale', component: ItemsForSaleComponent, canActivate: [RequireLoginGuard] },
    { path: 'account/listings', component: MyAdvertsComponent, canActivate: [RequireLoginGuard] },
    { path: 'account/create', component: CreateAccountTypeComponent },
    { path: 'account/create/trade', component: CreateTradeAccountComponent },
//    { path: 'account/login', component: LoginComponent },
    { path: 'account/login', component: HelpComponent },
    { path: 'account/reset-password', component: ResetPasswordComponent },
    { path: 'account/reset-password/:email/:token', component: ResetPasswordComponent },

    // Help
    { path: 'help', component: HelpComponent },
    { path: 'help/:fragment', component: HelpComponent },

    // Advert
    { path: 'search', component: SearchComponent },
    { path: 'search/:universalSearchTerm', component: SearchComponent },
    { path: 'search/:field/:value', component: SearchComponent },
    { path: 'search/results', component: SearchResultsComponent },
    { path: 'listing/create', component: AdvertCreateComponent, canActivate: [RequireLoginGuard] },
    { path: ':brand/:model/:id', component: AdvertViewComponent }, // This should be second to last, always!

    { path: 'broker', component: BrokerSimpleComponent },

    { path: 'sell-my-watch', component: SellMyWatchComponent },
    
    // Catch all
    { path: '**', component: NotFoundComponent }
];
