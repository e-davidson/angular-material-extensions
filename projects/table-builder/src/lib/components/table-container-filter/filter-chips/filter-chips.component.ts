import { Component } from '@angular/core';
import { TableStore } from '../../../classes/table-store';
import { FilterInfo } from '../../../classes/filter-info';
import { map } from 'rxjs/operators';
import { WrapperFilterStore } from '../table-wrapper-filter-store';

@Component({
  selector: 'lib-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['../gen-filter-displayer/gen-filter-displayer.component.css']
})
export class FilterChipsComponent {

  constructor( public tableState: TableStore, private filterStore : WrapperFilterStore) {
  }

    filters$ = this.tableState.filters$.pipe(map( filters => Object.values(filters)));

    deleteByIndex(index: number) {
      this.filterStore.deleteByIndex(index);
    }

    addFilter(filter:FilterInfo<any>){
      this.filterStore.addFilter(filter);
    }

    clearAll() {
        this.filterStore.clearAll();
    }

    currentFilters$ = this.filterStore.currentFilters$;
}
