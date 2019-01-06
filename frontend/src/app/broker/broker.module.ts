import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleComponent } from './simple/simple.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [
    SimpleComponent
  ],
  declarations: [SimpleComponent]
})
export class BrokerModule { }
