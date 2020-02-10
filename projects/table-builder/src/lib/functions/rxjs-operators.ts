import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as _ from 'lodash';

export const mapArray = <T, U>(mapFunc: (src: T) => U ) => (source: Observable<T[]>) =>
  source.pipe( map( src => src.map(mapFunc) ) );

export  const filterArray = <T>(filterFunc: (src: T) => boolean ) => (source: Observable<T[]>) =>
  source.pipe( map( src => src.filter(filterFunc) ) );


export const combineArrays = <T>(sources: Observable<T[]>[]): Observable<T[]> => {
  return combineLatest(
    sources.map( src => src.pipe(startWith([])))
  ).pipe(
    map( res => _.flatten(res) )
  );
};
