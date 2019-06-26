import { Directive, TemplateRef, Input, AfterContentInit, Optional } from '@angular/core';
import { CdkColumnDef } from '@angular/cdk/table';

// here is how to use it
// <generic-table [report]="report">
//     <p *customCell="'column1'; let element = element" [class.makeMeRed]="element?.port">If Port, i will be red</p>
//     <p *customCell="'column2'">I am custom cell two </p>
// </generic-table>
@Directive({
    selector: '[customCell]'
})
export class CustomCellDirective implements AfterContentInit {
    @Input() customCell: string;
    @Input() displayName: string;
    @Input() TemplateRef: TemplateRef<any>;
    @Input() customCellOrder: number;
    constructor(
      @Optional()  private templateRef: TemplateRef<any>,
      @Optional() public columnDef: CdkColumnDef
      ) {
      this.TemplateRef = this.templateRef;
     }
     ngAfterContentInit() {
      if (this.columnDef) {
        this.TemplateRef = this.columnDef.cell.template;
      } else if (this.TemplateRef === null) {
        this.TemplateRef = this.templateRef;
      }
    }
}
