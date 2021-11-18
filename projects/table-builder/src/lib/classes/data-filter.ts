import { Observable, combineLatest, of } from 'rxjs';
import { map, scan, shareReplay } from 'rxjs/operators';
import { combineArrays } from '../functions/rxjs-operators';
import { createFilterFunc, FilterInfo } from './filter-info';

export class DataFilter<T = any> {

  constructor(private filters$: Observable< Array< (val: any) => boolean>> ) {
  }

  filter(data: any[], filters: Array<(val: any) => boolean> ): any[] {
    return data.filter( r => filters.every( fltr => fltr(r)) );
  }

  filterData(data$: Observable<T[]>) {
    return combineLatest([data$, this.filters$]).pipe(
      map(([data, filters]) => this.filter(data, filters)),
      shareReplay({bufferSize: 1, refCount: true})
    );
  }

  appendFilters(filters$: Observable<FilterInfo[]>) : DataFilter {
    return new DataFilter(combineArrays([
      this.filters$ ?? of([]),
      filters$.pipe(map(fltrs => fltrs.map(filter => createFilterFunc(filter))))
    ]));
  }
}
