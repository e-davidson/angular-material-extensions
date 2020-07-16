import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataFilter } from './data-filter';


const data = [{
  name: 'bob',
  age: 10
},
{
  name: 'john',
  age: 11
},
{
  name: 'sally',
  age: 12
}
];

// Straight Jasmine testing without Angular's testing support

class ValueService {
  getValue = () => 'real value';

  getObservableValue() {
    return of(data);
  }

  getPromiseValue() {
    return this.getObservableValue().pipe(map(() => 'promise value')).toPromise();
  }
}

describe('Filter', () => {
  let service: ValueService;
  beforeEach(() => {
    service = new ValueService();
  });


  it('filter should return all when no filters',
    (done: DoneFn) => {
      const filter = new DataFilter(of([]), service.getObservableValue());
      filter.filteredData$.subscribe(d => {
        expect(d.length).toBe(3);
        done();
      });
    });

  it('single filter should work',
    (done: DoneFn) => {
      const filter = new DataFilter(of([
        d => d.name.includes('o')
      ]), service.getObservableValue());
      filter.filteredData$.subscribe(d => {
        expect(d.length).toBe(2);
        done();
      });
    });

  it('multiple filters should work',
    (done: DoneFn) => {
      const filter = new DataFilter(of([
        d => d.name.includes('o'),
        d => d.age > 10
      ]), service.getObservableValue());
      filter.filteredData$.subscribe(d => {
        expect(d.length).toBe(1);
        done();
      });
    });
});
