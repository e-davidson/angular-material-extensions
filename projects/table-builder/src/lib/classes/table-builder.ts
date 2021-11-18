import { isObservable, Observable, of } from 'rxjs';
import { MetaData, FieldType, ReportDef } from '../interfaces/report-def';
import { first, map, shareReplay, switchMap } from 'rxjs/operators';
import { mapArray } from '../functions/rxjs-operators';
import { GeneralTableSettings, TableBuilderSettings } from './table-builder-general-settings';

export function defaultShareReplay<T>() {
  return function (src: Observable<T>): Observable<T> {
    return src.pipe(shareReplay({ refCount: true, bufferSize: 1 }));
  };
}

export class TableBuilder<T = any> {

  metaData$: Observable<MetaData<T>[]>;
  constructor(private data$: Observable<T[]>,  metaData$?: Observable<MetaData<T>[]>, settings: TableBuilderSettings | Observable<TableBuilderSettings> = new GeneralTableSettings() ) {
    this.data$ = this.data$.pipe(defaultShareReplay());
    this.metaData$ = metaData$ ?
      metaData$.pipe(first(),defaultShareReplay()) :
      data$.pipe(first(), map( data => this.createMetaData(data[0]) ),defaultShareReplay());
    const s = isObservable(settings) ? settings : of(settings);
    this.settings = s.pipe(map(sett => new GeneralTableSettings(sett)),defaultShareReplay());
  }
  settings : Observable<GeneralTableSettings>;
  getData$(): Observable<any[]> {
    return this.metaData$.pipe(
      switchMap( metaData => this.data$.pipe(
        mapArray( data => this.cleanRecord(data, metaData ) )
      ))
    );
  }

  createMetaData(obj: any): MetaData [] {
    return Object.keys(obj ?? {})
    .map( key => ({
      key,
      fieldType: FieldType.Unknown,
      order: -1
    }));
  }

  cleanVal(val: any, metaData: MetaData): any {
    switch ( metaData.fieldType ) {
      case FieldType.Currency:
      case FieldType.Number:
        const num = Number( val );
        return isNaN(num) || val == null ? null : num;
      case FieldType.Date:
        const date = Date.parse(val);
        if(isNaN(date)){
          return null;
        }
        const d = new Date(date);
        d.setHours(0,0,0,0);
        return d;
    }
    return val;
  }

  cleanRecord( record: T, metadata: MetaData []): T  {
    const cleaned = metadata.reduce( (prev: T, curr: MetaData<T>) => {
      prev[curr.key] = this.cleanVal(record[curr.key], curr);
      return prev;
    }, {} as T )
    return {...record, ...cleaned};
  }
}

export const CreateTableBuilder = (reportDef$: Observable<ReportDef> ): TableBuilder => {
  reportDef$ = reportDef$.pipe(defaultShareReplay());
  return new TableBuilder(reportDef$.pipe(map( r => r.data) ), reportDef$.pipe( map ( r => r.metaData) ));
};
