import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as _ from 'lodash';

export const mapArray = <T, U>(mapFunc: (src: T) => U ) => (source: Observable<T[]>) =>
  source.pipe( map( src => src.map(mapFunc) ) );

export  const filterArray = <T>(filterFunc: (src: T) => boolean ) => (source: Observable<T[]>) =>
  source.pipe( map( src => src.filter(filterFunc) ) );

export const onWait = <T>(val: T) => (source: Observable<T>) => {
  return new Observable<T>(subscriber => {
    let emitted = false;
    setTimeout(() => {
      if(!emitted) {
        subscriber.next(val);
      }
    }, 0);
    source.subscribe({
      next(x) { emitted = true; subscriber.next(x) },
      error(err) { emitted = true; subscriber.error(err) },
      complete() { emitted = true; subscriber.complete(); }
    });
  });
}

export const combineArrays = <T>(sources: Observable<T[]>[]): Observable<T[]> => {
  return combineLatest(
    sources.map( src => src.pipe(onWait([])))
  ).pipe(
    map( res => _.flatten(res) )
  );
};
