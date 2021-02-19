import { Directive, OnInit, OnDestroy } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { TableStore } from '../classes/table-store';

@Directive({
  selector: '[multiSort]',
  exportAs: 'multiSort',
  inputs: ['disabled: matSortDisabled'],
  providers: [
    { provide: MatSort, useExisting: MultiSortDirective }
  ]
})
export class MultiSortDirective extends MatSort implements OnInit, OnDestroy {
  rules: Sort[] = [];

  constructor(private state: TableStore) {
    super();
    this.state.setSort(this.sortChange.pipe(map(sc => ({ key: sc.active, direction: sc.direction }))));
    this.state.on(
      this.state.sorted$,
      rules => {
        this.rules = rules;

        if (this.active && rules.length === 0) {
          this.active = '';
          this.direction = '';
          this.sortChange.emit({ active: '', direction: '' });
        }

        if(rules.length > 0 && (this.active !== rules[0].active || this.direction !== rules[0].direction)) {
          this.active = rules[0].active;
          this.direction = rules[0].direction;
          this.sortChange.emit(rules[0]);
        }

      }
    );
  }

}
