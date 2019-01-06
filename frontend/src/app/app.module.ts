import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { routes } from './routes';
import { AuthInterceptor } from './auth.interceptor';
import { RequireLoginGuard } from './require-login.guard';

import { ProductService } from './product.service';
import { UserService } from './user.service';

import { AccountModule } from './account/account.module';
import { AdvertModule } from './advert/advert.module';
import { BrokerModule } from './broker/broker.module';

import { AppComponent } from './app.component';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { HomeComponent } from './home/home.component';
import { FooterBarComponent } from './footer-bar/footer-bar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoadingComponent } from './loading/loading.component';

import { FlashService } from './flash.service';
import { AboutComponent } from './about/about.component';
import { ServicesComponent } from './services/services.component';
import { SellMyWatchComponent } from './sell-my-watch/sell-my-watch.component';
import { HelpComponent } from './help/help.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderBarComponent,
    HomeComponent,
    FooterBarComponent,
    NotFoundComponent,
    LoadingComponent,
    AboutComponent,
    ServicesComponent,
    SellMyWatchComponent,
    HelpComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule,
    HttpClientModule,
    NgbModule.forRoot(),

    AccountModule,
    AdvertModule,
    BrokerModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    RequireLoginGuard,
    FlashService,
    ProductService,
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
