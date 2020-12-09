import { Directive, TemplateRef, Input, AfterContentInit, Optional } from '@angular/core';
import { CdkColumnDef } from '@angular/cdk/table';
import { SortDef, MetaData, FieldType } from '../interfaces/report-def';

// here is how to use it
// <generic-table [report]="report">
//     <p *customCell="'column1'; let element = element" [class.makeMeRed]="element?.port">If Port, i will be red</p>
//     <p *customCell="'column2'">I am custom cell two </p>
// </generic-table>
@Directive({
    selector: '[customCell]',
})
export class CustomCellDirective implements AfterContentInit {
    @Input() customCell: string;
    @Input() displayName: string;
    @Input() preSort: SortDef;
    @Input() TemplateRef: TemplateRef<any>;
    @Input() customCellOrder: number;
    @Input() customCellWidth: string;
    constructor(
      @Optional()  private templateRef: TemplateRef<any>,
      @Optional() public columnDef: CdkColumnDef
      ) {
        this.TemplateRef = this.templateRef;
     }
     ngAfterContentInit() {
      if (this.TemplateRef === null) {
        this.TemplateRef = this.templateRef;
      }
    }

    getMetaData(metaData? : MetaData): MetaData {
      return {
        key: this.customCell,
        displayName: this.displayName ?? metaData?.displayName,
        preSort: this.preSort ?? metaData?.preSort,
        fieldType: metaData?.fieldType ??  FieldType.Unknown,
        order: this.customCellOrder ?? metaData?.order,
        _internalNotUserDefined: !(!!metaData),
        width: this.customCellWidth ?? metaData?.width,
        customCell: true,
        noExport: !metaData
      };
    }
}
