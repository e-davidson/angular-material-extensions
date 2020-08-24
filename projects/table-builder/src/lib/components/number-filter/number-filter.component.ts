import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FilterType, InTypes } from '../../enums/filterTypes';
import { ControlContainer, NgForm } from '@angular/forms';


@Component({
  selector: 'tb-number-filter',
  templateUrl: './number-filter.component.html',
  styleUrls: ['./number-filter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [{provide: ControlContainer, useExisting: NgForm}]
})
export class NumberFilterComponent {
  FilterType = FilterType;
  _CurrentFilterType: FilterType;
  @Input() set CurrentFilterType(CurrentFilterType: FilterType){
    this._CurrentFilterType = CurrentFilterType;
    this.isInType = InTypes.includes(this._CurrentFilterType);
    this.isStandard = !(this.isInType || this._CurrentFilterType === FilterType.NumberBetween || this._CurrentFilterType === FilterType.IsNull);
  };
  @Input() info;
  isStandard : boolean;
  isInType : boolean;
  inputRegexForInFilter = /[^0-9 \,]/;
}
