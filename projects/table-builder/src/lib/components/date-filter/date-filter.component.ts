import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FilterInfo } from '../../classes/filter-info';
import { FilterType } from '../../enums/filterTypes';
import { debounceTime } from 'rxjs/operators';
import { ControlContainer, NgForm } from '@angular/forms';

@Component({
    selector: 'tb-date-filter',
    templateUrl: './date-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    viewProviders: [{provide: ControlContainer, useExisting: NgForm}]
})
export class DateFilterComponent {
    FilterType = FilterType;
    @Input() info: FilterInfo;
    @Input() CurrentFilterType: FilterType;
}
