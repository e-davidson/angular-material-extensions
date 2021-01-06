import { Directive,  Input, ElementRef } from '@angular/core';


@Directive({
    selector: '[styler]',
}) export class StylerDirective {
  @Input() set styler(styles){
    if(styles){
      Object.keys(styles).forEach( style => {
        this.el.nativeElement.style[style] = styles[style];
      });
    }
  };
  constructor(private el: ElementRef) {
 }
}
