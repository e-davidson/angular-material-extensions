import { Observable } from 'rxjs';
import { MetaData, FieldType, ReportDef, TableOptions, DefaultTableOptions } from '../interfaces/report-def';
import { first, map, switchMap, shareReplay, publishReplay, refCount } from 'rxjs/operators';
import { mapArray } from '../functions/rxjs-operators';

export class TableBuilder<T = any> {
  constructor(private data$: Observable<T[]>, public metaData$?: Observable<MetaData<T>[]>, options : TableOptions = DefaultTableOptions) {
    this.data$ = this.data$.pipe(publishReplay(1),refCount());
    this.metaData$ = this.metaData$ ?
      this.setUpMeta(this.data$,this.metaData$,options) :
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
    }) );
  }

  cleanVal(val: any, metaData: MetaData): any {
    switch ( metaData.fieldType ) {
      case FieldType.Currency:
      case FieldType.Number:
        const num = Number( val );
        return isNaN(num) || val == null ? null : num;
      case FieldType.Date:
        const date = Date.parse(val);
        return isNaN(date) ? null : new Date(date);
    }
    return val;
  }

  cleanRecord( record: T, metadata: MetaData []): T  {
    const cleaned = metadata.reduce( (prev: T, curr: MetaData) => {
      prev[curr.key] = this.cleanVal(record[curr.key], curr);
      return prev;
    }, {} )
    return {...record, ...cleaned};
  }

  setUpMeta(data$:Observable<T[]>, metaData$:Observable<MetaData<T>[]>, options : TableOptions):Observable<MetaData<T>[]>{
    const metas$ = metaData$.pipe(first(),shareReplay({bufferSize:1,refCount:true}));
    if(options.metaDataPlusRestOfFields){
      return data$.pipe(
        switchMap(data => metas$.pipe(
            map(metas => {
              const aggregateMeta = this.createMetaData(data[0]).map(metaFromData => {
                const metaFromMeta = metas.find(meta => meta.key === metaFromData.key);
                if(metaFromMeta) return metaFromMeta;
                return metaFromData;
              });
              return aggregateMeta;
          }))),
          shareReplay({bufferSize:1,refCount:true})
      );
    } 
    else {
      return metas$;
    }
  }
}

export const CreateTableBuilder = (reportDef$: Observable<ReportDef> ): TableBuilder => {
  reportDef$ = reportDef$.pipe(publishReplay(1),refCount());
  return new TableBuilder(reportDef$.pipe(map( r => r.data) ), reportDef$.pipe( map ( r => r.metaData) ));
};
