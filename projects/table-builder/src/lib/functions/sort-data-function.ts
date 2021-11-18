import { Sort, SortDirection } from "@angular/material/sort";
import { orderBy } from 'lodash';

export type direc = 'asc' | 'desc' | boolean;

export function sortData<T>(data: T[], sorted: Sort[]): T[] {
  return orderBy(data, sorted.map(r => r.active), sorted.map(r => r.direction as direc ));
}
