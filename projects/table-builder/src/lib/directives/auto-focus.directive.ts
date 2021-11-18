import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[autoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {

  @Input() autoFocus = true;
  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit() {
    if(this.autoFocus){
      setTimeout(() => {
        this.elementRef.nativeElement.focus();
      });
    }
  }

}
