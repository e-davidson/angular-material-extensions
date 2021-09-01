import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MetaData, FieldType } from '../../../interfaces/report-def';
import { Observable } from 'rxjs';
import { TableStore } from '../../../classes/table-store';
import { map } from 'rxjs/operators';
import { WrapperFilterStore } from '../table-wrapper-filter-store';

@Component({
    selector: 'tb-filter-displayer',
    templateUrl: './gen-filter-displayer.component.html',
    styleUrls: ['./gen-filter-displayer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenFilterDisplayerComponent {

  constructor( public tableState: TableStore, private filterStore : WrapperFilterStore) {
    this.filterCols$ =  tableState.metaDataArray$.pipe(
      map(md => Object.values( md ).filter(m => (m.fieldType !== FieldType.Hidden) && (!m.noFilter))),
    );
  }

    filterCols$: Observable<MetaData[]>;

    addFilter(metaData: MetaData) {
      this.filterStore.addFilter({key: metaData.key, fieldType: metaData.fieldType});
    }
}
