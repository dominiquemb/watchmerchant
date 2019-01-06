import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit, AfterViewInit {
  @ViewChild('buying') public buying:ElementRef;
  @ViewChild('selling') public selling:ElementRef;
  @ViewChild('faq') public faq:ElementRef;
  @ViewChild('workwithus') public workwithus:ElementRef;

  route:string = "";

  constructor(router: Router) {
	router.events.subscribe((url:any) => {
		if (url.urlAfterRedirects) {
			this.route = url.urlAfterRedirects;
		}
	});
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
	setTimeout(() => {
		if (this.route.indexOf('buying') > -1) {
			this.buying.nativeElement.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'start'});
		}
		else if (this.route.indexOf('selling') > -1) {
			this.selling.nativeElement.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'start'});
		}
		else if (this.route.indexOf('faq') > -1) {
			this.faq.nativeElement.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'start'});
		}
		else if (this.route.indexOf('workwithus') > -1) {
			this.workwithus.nativeElement.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'start'});
		}
	}, 1);
  }
}
