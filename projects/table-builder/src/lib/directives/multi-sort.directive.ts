import { Directive, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { MatSort, Sort, MatSortable } from '@angular/material';
import { Subject, Subscription, Observable } from 'rxjs';

@Directive({
  selector: '[multiSort]',
  exportAs: 'multiSort',
  inputs: ['disabled: matSortDisabled'],
  providers: [
    { provide: MatSort, useExisting: MultiSortDirective }
  ]
})
export class MultiSortDirective extends MatSort implements OnInit, OnDestroy{
  @Output('multiSortChange') readonly rulesChange: EventEmitter<Sort[]> = new EventEmitter<Sort[]>();

  @Input() rules$: Observable<Sort[]> = new Subject();
  rules: Sort[] = [];

  private SubRef: Subscription;

  ngOnInit() {
    this.SubRef = this.rules$.subscribe( rules => {
      if (rules.length) {
        var initRules = [...rules];
        const firstRule = initRules.shift();
        this.rules = initRules;
        this.sort({id: firstRule.active, start: firstRule.direction || 'asc', disableClear: false});
      }
    });
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.SubRef.unsubscribe();
    super.ngOnDestroy();
  }

  sort(sortable: MatSortable): void {
    this.rules = this.rules.filter(r => r.active != sortable.id);

    if (this.active !== sortable.id) {
      this.rules.unshift({ active: sortable.id, direction: sortable.start ? sortable.start : this.start });
    } else {
      const newDirection = this.getNextSortDirection(sortable);
      if (newDirection) {
        this.rules.unshift({ active: this.active, direction: newDirection });
      }
    }

    super.sort(sortable);
    this.rulesChange.emit(this.rules);
  }
}
