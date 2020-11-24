import { Observable } from 'rxjs';
import { orderBy } from 'lodash';
import { direc } from '../components/generic-table/generic-table.component';
import { MultiSortDirective } from '../directives/multi-sort.directive';
import {MatTableObservableDataSource} from './MatTableObservableDataSource'

export class GenericTableDataSource<T> extends MatTableObservableDataSource<T>
{
  constructor(dataSrc: Observable<T[]>)
  {
    super(dataSrc);
    this.sortData = (data: {}[], sort: MultiSortDirective) =>
      orderBy(data, sort.rules.map(r => r.active), sort.rules.map(r => r.direction as direc ));
  }
}