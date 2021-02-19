import { Sort } from "@angular/material/sort";
import { direc } from "../..";
import { orderBy } from 'lodash';

export const sortData = <T>(data: T[], sorted: Sort[]): T[] =>
  orderBy(data, sorted.map(r => r.active), sorted.map(r => r.direction as direc ));
