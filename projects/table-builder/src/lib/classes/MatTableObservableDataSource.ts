import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { direc } from '../components/generic-table/generic-table.component';
import { MultiSortDirective } from '../directives/multi-sort.directive';
import { orderBy } from 'lodash';

export class MatTableObservableDataSource<T> extends  MatTableDataSource<T> {
  subscription: Subscription;
  constructor(private dataSrc: Observable<T[]>) {
    super([]);
    this.sortData = (data: {}[], sort: MultiSortDirective) => !sort.rules ? 
      this.sortData 
      : orderBy(data, sort.rules.map(r => r.active), sort.rules.map(r => r.direction as direc ));
  }

  connect() {
    if (!this.subscription) {
      this.subscription = this.dataSrc.subscribe( data => this.data = data );
    }
    return super.connect();
  }
  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    super.disconnect();
  }
}
