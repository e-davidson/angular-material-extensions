import { TemplateRef } from '@angular/core';
import { MetaData } from './report-def';

export class ColumnTemplates {
  header: TemplateRef<any>;
  footer: TemplateRef<any>;
  body: TemplateRef<any>;
  metaData: MetaData;
}
