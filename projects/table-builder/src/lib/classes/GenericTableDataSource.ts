import { Observable } from 'rxjs';
import { MultiSortDirective } from '../directives/multi-sort.directive';
import { MatTableObservableDataSource } from './MatTableObservableDataSource'
import { sortData } from '../functions/sort-data-function';
import { MatSort } from '@angular/material/sort';


export function isMultiSort(sort: MatSort): sort is MultiSortDirective {
    return Array.isArray((sort as MultiSortDirective ).rules);
}

export class GenericTableDataSource<T> extends MatTableObservableDataSource<T>
{

  constructor(dataSrc: Observable<T[]>)
  {
    super(dataSrc);

    const baseSort = this.sortData;
    this.sortData = ((data: T[], sort:  MatSort) => isMultiSort(sort) ?  sortData(data, sort.rules) : baseSort(data, sort));
  }
}
