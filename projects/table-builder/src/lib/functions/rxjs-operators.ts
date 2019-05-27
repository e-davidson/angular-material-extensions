import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const mapArray = <T, U>(mapFunc: (src: T) => U ) => (source: Observable<T[]>) =>
  source.pipe( map( src => src.map(mapFunc) ) );

export  const filterArray = <T>(filterFunc: (src: T) => boolean ) => (source: Observable<T[]>) =>
  source.pipe( map( src => src.filter(filterFunc) ) );

