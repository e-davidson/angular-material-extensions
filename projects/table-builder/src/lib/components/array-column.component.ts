import { ChangeDetectionStrategy, Component, Input, Inject } from '@angular/core';
import { ColumnBuilderComponent } from './column-builder/column-builder.component';
import { MetaData, ArrayStyle, ArrayAdditional } from '../interfaces/report-def';
import { TableBuilderConfigToken, TableBuilderConfig } from '../classes/TableBuilderConfig';





@Component({
  selector: 'tb-array-column',
  template: `
  <ng-container  *ngIf="array.length === 0; else hasVals">-</ng-container>
  <ng-template #hasVals>
  <ng-container [ngSwitch]="style">
<ng-container *ngSwitchCase="ArrayStyle.CommaDelimited">
 <span *ngFor="let val of array; last as isLast">{{val}}<ng-container *ngIf="!isLast">, </ng-container> </span>
</ng-container>
<ng-container *ngSwitchCase="ArrayStyle.NewLine">
<span *ngFor="let val of array; last as isLast">{{val}}<ng-container *ngIf="!isLast"><br /></ng-container> </span>
</ng-container>
</ng-container>
  </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArrayColumnComponent {
  ArrayStyle = ArrayStyle;
  metaData: MetaData;
  style: ArrayStyle;
  additional: ArrayAdditional;
  limit: number;
  @Input() array: any[];

  constructor(private parent: ColumnBuilderComponent,
    @Inject(TableBuilderConfigToken) private config: TableBuilderConfig
    ) {
    this.metaData = parent.metaData;
    this.additional = this.metaData?.additional as ArrayAdditional;
    this.style = this.additional?.arrayStyle ?? ArrayStyle.CommaDelimited;
    this.limit = this.additional?.limit ?? this.config.arrayInfo?.limit ?? 3;
  }

  ngOnInit() {
    this.array = (this.array ?? []).slice(0,3);
  }
}
