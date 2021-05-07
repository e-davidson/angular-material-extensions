import { Observable } from 'rxjs';
import { MultiSortDirective } from '../directives/multi-sort.directive';
import {MatTableObservableDataSource} from './MatTableObservableDataSource'
import { sortData } from '../functions/sort-data-function';

export class GenericTableDataSource<T> extends MatTableObservableDataSource<T>
{
  constructor(dataSrc: Observable<T[]>)
  {
    super(dataSrc);
    this.sortData = (data: T[], sort: MultiSortDirective) => sortData(data, sort.rules)
  }
}
