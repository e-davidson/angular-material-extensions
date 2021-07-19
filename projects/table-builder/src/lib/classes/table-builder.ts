import { Observable } from 'rxjs';
import { MetaData, FieldType, ReportDef } from '../interfaces/report-def';
import { first, map, switchMap, shareReplay, publishReplay, refCount } from 'rxjs/operators';
import { mapArray } from '../functions/rxjs-operators';

export class TableBuilder<T = any> {
  constructor(private data$: Observable<T[]>, public metaData$?: Observable<MetaData<T>[]> ) {
    this.data$ = this.data$.pipe(publishReplay(1),refCount());
    this.metaData$ = this.metaData$ ?
      this.metaData$.pipe(first(),shareReplay()) :
      data$.pipe(first(), map( data => this.createMetaData(data[0]) ),shareReplay() );
  }

  getData$(): Observable<any[]> {
    return this.metaData$.pipe(
      switchMap( metaData => this.data$.pipe(
        mapArray( data => this.cleanRecord(data, metaData ) )
      ))
    );
  }

  createMetaData(obj): MetaData [] {
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
    const cleaned = metadata.reduce( (prev: T, curr: MetaData) => {
      prev[curr.key] = this.cleanVal(record[curr.key], curr);
      return prev;
    }, {} as T )
    return {...record, ...cleaned};
  }
}

export const CreateTableBuilder = (reportDef$: Observable<ReportDef> ): TableBuilder => {
  reportDef$ = reportDef$.pipe(publishReplay(1),refCount());
  return new TableBuilder(reportDef$.pipe(map( r => r.data) ), reportDef$.pipe( map ( r => r.metaData) ));
};
