import { Component, TemplateRef, ViewChild } from "@angular/core";

@Component({
  templateUrl: './initialization-component.html'
})
export class InitializationComponent {
  @ViewChild('boolean', {static: true}) booleanTemplate : TemplateRef<any>;
  @ViewChild('link', {static: true}) linkTemplate : TemplateRef<any>;
  @ViewChild('imageUrl', {static: true}) imageUrlTemplate : TemplateRef<any>;
  @ViewChild('currency', {static: true}) currencyTemplate : TemplateRef<any>;
  @ViewChild('array', {static: true}) arrayTemplate : TemplateRef<any>;
  @ViewChild('expression', {static: true}) expressionTemplate : TemplateRef<any>;
  @ViewChild('default', {static: true}) defaultTemplate : TemplateRef<any>;
  @ViewChild('enum', {static: true}) enumTemplate : TemplateRef<any>;

}
