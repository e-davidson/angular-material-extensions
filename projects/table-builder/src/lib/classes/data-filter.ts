import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export class DataFilter {
  filteredData$: Observable<any[]>;
  constructor(filters$: Observable< Array< (val: any) => boolean>>, data$: Observable<any[]>) {
    this.filteredData$ = combineLatest([data$, filters$.pipe(startWith([]))]).pipe(
      map(([data, filters]) => this.filter(data, filters)),
    );
  }

  filter(data: any[], filters: Array<(val: any) => boolean> ): any[] {
    return data.filter( r => filters.every( fltr => fltr(r)) );
  }
}
