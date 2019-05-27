import { Observable } from 'rxjs';
import { MetaData, FieldType, ReportDef } from '../interfaces/report-def';
import { first, map, switchMap, shareReplay } from 'rxjs/operators';
import { mapArray } from '../functions/rxjs-operators';

export class TableBuilder {
  constructor(private data$: Observable<any[]>, public metaData$?: Observable<MetaData[]> ) {
    if (!this.metaData$) {
      this.metaData$ = data$.pipe(first(), map( data => this.createMetaData(data[0]) ) );
    }
  }

  getData$(): Observable<any[]> {
    return this.metaData$.pipe(
      switchMap( metaData => this.data$.pipe(
        mapArray( data => this.cleanRecord(data, metaData ) )
      ))
    );
  }

  createMetaData(obj): MetaData [] {
    return Object.keys(obj)
    .map( key => ({
      key: key,
      fieldType: FieldType.Unknown,
      order: -1
    }) );
  }

  cleanVal(val: any, metaData: MetaData): any {
    switch ( metaData.fieldType ) {
      case FieldType.Currency:
      case FieldType.Number:
        const num = Number( val );
        return isNaN(num) ? null : num;
      case FieldType.Date:
        const date = Date.parse(val);
        return isNaN(date) ? null : new Date(date);
    }
    return val;
  }

  cleanRecord( record: any, metadata: MetaData []): any  {
    metadata.forEach( md => {
      record[md.key] = this.cleanVal(record[md.key], md);
    });
    return record;
  }
}

export const CreateTableBuilder = (reportDef$: Observable<ReportDef> ): TableBuilder => {
  reportDef$ = reportDef$.pipe(shareReplay(1));
  return new TableBuilder(reportDef$.pipe(map( r => r.data) ), reportDef$.pipe( map ( r => r.metaData) ));
};
