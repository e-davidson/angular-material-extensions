import { flatten } from 'lodash';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';

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
    map( res => flatten(res) )
  );
};

export function switchOff( switchSource: Observable<boolean>, defaultState: boolean = true) {
  return <T>(source: Observable<T>) : Observable<T> => {
    return new Observable(subsciber => {
      let isOn = defaultState;
      const subscription = new Subscription();
      subscription.add( switchSource.subscribe( on => isOn = on ));
      subscription.add(source.subscribe({
        next(value) {
          if(isOn) {
            subsciber.next(value);
          }
        },
        error: error => subsciber.error(error),
        complete: () => subsciber.complete()
      }));
      return subscription;
    });
  }
}

export function skipOneWhen( skipper: Observable<any> ) {
  return <T>(source: Observable<T>) : Observable<T> => {
    return new Observable(subsriber => {
      const subscription = new Subscription();
      let skipNext = false;
      subscription.add(skipper.subscribe( _ => skipNext = true));
      subscription.add(source.subscribe({
        next(value) {
          if(skipNext) {
            skipNext = false;
          } else {
            subsriber.next(value);
          }
        },
        error: error => subsriber.error(error),
        complete: () => subsriber.complete()
      }));
      return subscription;
    });
  }
}

export const previousAndCurrent = <T>(startingValue : T) => (obs : Observable<T>) => 
  obs.pipe(startWith(startingValue), pairwise());
export const notNull = <T>() => (obs:Observable<T>)=>obs.pipe(
  filter(data => data != null)
)
