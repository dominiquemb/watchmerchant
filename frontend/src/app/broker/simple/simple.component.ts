import { Component, OnInit, AfterViewInit, Renderer2, Inject, ElementRef, ViewChild, TemplateRef, ViewRef } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

@Component({
  selector: 'simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.scss']
})
export class SimpleComponent implements AfterViewInit {
  // @ViewChild('form') form: TemplateRef<any>;

  constructor(private _element: ElementRef, private _renderer: Renderer2, @Inject(DOCUMENT) private _document) { }

  ngAfterViewInit() {
    const s2 = this._renderer.createElement('script');
    s2.text = `hbspt.forms.create({portalId: "4349413",formId: "f90d1377-001e-4549-9279-d1f4fef8cafb", target: ".broker-form" });`;
    // let elementRef: ElementRef = this.form.elementRef;
    // console.log(elementRef.nativeElement);
    this._renderer.appendChild(this._document.querySelector('.broker-form'), s2);
  }

}
