import { Directive, ElementRef, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appAutoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {

  sub: Subscription;
  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.elementRef.nativeElement.focus();
    });
  }

}
