import { ChangeDetectionStrategy, Component, Input, Inject } from '@angular/core';
import { ArrayStyle, ArrayAdditional, MetaData } from '../interfaces/report-def';
import { TableBuilderConfigToken, TableBuilderConfig } from '../classes/TableBuilderConfig';


@Component({
  selector: 'tb-array-column',
  template: `
  <ng-container  *ngIf="array.length === 0; else hasVals">-</ng-container>
  <ng-template #hasVals>
    <ng-container [ngSwitch]="additional.arrayStyle">
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
  additional!: ArrayAdditional;
  @Input() array!: any[];
  @Input() metaData!: MetaData;

  constructor( @Inject(TableBuilderConfigToken) private config: TableBuilderConfig
    ) {

  }

  ngOnInit() {
    this.additional = this.metaData?.additional ??  this.config.arrayInfo ?? { limit: 3, arrayStyle: ArrayStyle.NewLine } as ArrayAdditional;
    this.array = (this.array ?? []).slice(0, this.additional.limit );

  }
}
