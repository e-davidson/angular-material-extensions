import { Observable, combineLatest } from 'rxjs';
import { map, refCount, publishReplay } from 'rxjs/operators';

export class DataFilter {
  filteredData$: Observable<any[]>;
  constructor(filters$: Observable< Array< (val: any) => boolean>>, data$: Observable<any[]>) {
    this.filteredData$ = combineLatest([data$, filters$]).pipe(
      map(([data, filters]) => this.filter(data, filters)),
      publishReplay(1),
      refCount()
    );
  }

  filter(data: any[], filters: Array<(val: any) => boolean> ): any[] {
    return data.filter( r => filters.every( fltr => fltr(r)) );
  }
}
