import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
    @Directive({
        selector: '[appRestrictRegex]'
    })
    export class InputRestrictionDirective {

        @Input('appRestrictRegex') appInputRestriction: RegExp;
        @Input() notGlobal = false;

        constructor(public model: NgControl) {}
        @HostListener('ngModelChange', ['$event']) onModelChange(event) {
           const properValue = String(event).replace(this.appInputRestriction,'');
           this.model.control.setValue(properValue, {
            emitEvent: false,
            onlySelf: false,
            emitModelToViewChange: false,
            emitViewToModelChange: true
          });
          this.model.valueAccessor.writeValue(properValue);
        }

        ngOnInit(){
          if(!this.notGlobal){
            this.appInputRestriction = new RegExp(this.appInputRestriction,this.appInputRestriction.flags+(this.appInputRestriction.global ? '' : 'g'));
          }
        }
    }