import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FilterType } from '../../enums/filterTypes';
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
  @Input() CurrentFilterType: FilterType;
  @Input() info;
}
