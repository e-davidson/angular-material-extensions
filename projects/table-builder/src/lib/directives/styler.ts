import { Directive,  Input, ElementRef } from '@angular/core';


@Directive({
    selector: '[styler]',
}) export class StylerDirective {
  @Input() styler: any;
  constructor(private el: ElementRef) {
 }

 ngOnInit() {
   if(this.styler){
     Object.keys( this.styler).forEach( style => {
       this.el.nativeElement.style[style] = this.styler[style];
     });
   }
 }
}
