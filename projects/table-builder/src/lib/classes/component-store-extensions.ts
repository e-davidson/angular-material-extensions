import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


interface ConcreteClass<C> { new (...args: any[]): C; }


interface ComponentStoreType<T extends {}> extends ConcreteClass<ComponentStore<T>> {

}

export function ComponentStoreExtensions<T extends {}>(){
  return function <U extends ComponentStoreType<T>>(constructor: U) {
    return class U extends constructor {
      on = <V>(srcObservable: Observable<V>, func: (obj: V) => void) => {
        this.effect((src: Observable<V>) => {
          return src.pipe(tap(func));
        })(srcObservable);
      }
    };
  }
}
