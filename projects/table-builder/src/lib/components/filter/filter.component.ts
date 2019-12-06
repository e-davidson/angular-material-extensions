import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FilterInfo, filterTypeMap } from '../../classes/filter-info';
import { FilterType } from '../../enums/filterTypes';
import { FieldType } from '../../interfaces/report-def';
import { debounceTime } from 'rxjs/operators';
import { MetaData } from 'dist/mx-table-builder/public-api';

@Component({
    selector: 'tb-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent {
    filterTypes = filterTypeMap;
    @Input() metaData: MetaData;
    @Input() info: FilterInfo;
    @Output() delete$ = new EventEmitter();
    change$  = new EventEmitter();
    @Output() filter$ = this.change$.pipe(debounceTime(250));
    FilterType = FilterType;
    FieldType = FieldType;
}
