import { ComponentFactoryResolver, Injector } from "@angular/core";
import { Injectable, TemplateRef } from "@angular/core";
import { InitializationComponent } from "../components/initialization-component/initialization-component";
import { FieldType } from "../interfaces/report-def";

@Injectable({providedIn: 'root'})
export class TableTemplateService {
  instance: InitializationComponent;
  templates;

  initTemplates() {
    this.templates = { };
    this.templates[FieldType.Array] = this.instance.arrayTemplate;
    this.templates[FieldType.Boolean] = this.instance.booleanTemplate;
    this.templates[FieldType.Currency] = this.instance.currencyTemplate;
    this.templates[FieldType.Date] = this.instance.defaultTemplate;
    this.templates[FieldType.Expression] = this.instance.expressionTemplate;
    this.templates[FieldType.ImageUrl] = this.instance.imageUrlTemplate;
    this.templates[FieldType.Link] = this.instance.linkTemplate;
    this.templates[FieldType.Number] = this.instance.defaultTemplate;
    this.templates[FieldType.PhoneNumber] = this.instance.defaultTemplate;
    this.templates[FieldType.String] = this.instance.defaultTemplate;
    this.templates[FieldType.Unknown] = this.instance.defaultTemplate;
    this.templates[FieldType.Enum] = this.instance.enumTemplate;
  }
  getTemplate(fieldType: FieldType) : TemplateRef<any> {
    return this.templates[fieldType];
  }

  constructor(resolver: ComponentFactoryResolver, i: Injector) {
        const factory = resolver.resolveComponentFactory(InitializationComponent);
        const c = factory.create(i);
        this.instance = c.instance;
        this.initTemplates();
  }
}
