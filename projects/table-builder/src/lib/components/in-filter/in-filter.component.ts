import { ChangeDetectionStrategy, Component, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlContainer, NgForm, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FilterInfo } from '../../classes/filter-info';
import { FieldType } from '../../interfaces/report-def';

@Component({
  selector: 'lib-in-filter',
  templateUrl: './in-filter.component.html',
  styleUrls: ['./in-filter.component.css'],
  changeDetection:ChangeDetectionStrategy.OnPush,
  viewProviders: [{provide: ControlContainer, useExisting: NgForm}],
})
export class InFilterComponent implements OnInit {
  FieldType = FieldType;
  private _backingStore : FilterInput[] = [{value:undefined}];
  Inputs$ = new BehaviorSubject(this._backingStore);
  @Input() type : FieldType;
  @Input() info:FilterInfo;
  addInput(){
    this._backingStore = [...this._backingStore,{value:undefined}];
    this.Inputs$.next([...this._backingStore]);
  }

  removeInput(index: number){
    this._backingStore.splice(index,1);
    this.Inputs$.next([...this._backingStore]);
  }
  constructor() { }

  ngOnInit(): void {
    if(this.info?.filterValue){
      this._backingStore = this.info.filterValue.map(v => ({...v}));
      this.Inputs$.next([...this._backingStore]);
    }
  }

  recordValue(inputs:FilterInput[],i:number,value: number | string){
    this._backingStore = [...inputs];
    this._backingStore[i] = {...this._backingStore[i],value};
    this.Inputs$.next([...this._backingStore]);
  }

}

export interface FilterInput {
  value: string | number;
}
