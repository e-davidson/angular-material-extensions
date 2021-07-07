import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TableStore } from '../../../classes/table-store';
import { Dictionary } from '../../../interfaces/dictionary';
import { FieldType, MetaData } from '../../../interfaces/report-def';


@Component({
  selector: 'tb-in-list-filter',
  template: `
  <div *ngFor="let item of keyValues$ | async| keyvalue" >
    <mat-checkbox [checked]='selectedKeys.includes(item.key)' stop-propagation (change)='selectFilterChanged($event, item.key)' >{{item.value}}</mat-checkbox>
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: InListFilterComponent,
    multi: true
  }],
})
export class InListFilterComponent implements ControlValueAccessor {
  constructor(private ref: ChangeDetectorRef, private tableState: TableStore) {}
  value: string[] = [];
  writeValue(obj: string[]): void {
    this.value = obj;

    if(this.value) {
      this.selectedKeys = this.value.map( f => f );
    }
    this.ref.markForCheck();
  }

  onChange = (_: any) => { };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  onTouched = () => { };
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  @Input() key: string;

  keyValues$ : Observable<Dictionary<string>>;
  selectedKeys : string[] = [];
  metaData: MetaData;

  ngOnInit() {
    this.keyValues$ = this.tableState.getMetaData$(this.key).pipe(
      tap(metaData => this.metaData = metaData),
      map( metaData => {
        if(metaData.additional?.filterOptions?.filterableValues ) {
          return  metaData.additional.filterOptions.filterableValues.reduce( (prev, cur)=> { prev[cur] = cur; return prev }, {});
        } else {
          if(metaData.fieldType === FieldType.Enum ) {
            return metaData.additional.enumMap;
          }
        }
      })
    );
  }

  selectFilterChanged($event, val) {
    if($event.checked) {
      this.selectedKeys.push(val);
    } else {
      this.selectedKeys = this.selectedKeys.filter( item => item !== val);
    }

   this.value = this.selectedKeys;
    this.onChange(this.value);
  }

}
