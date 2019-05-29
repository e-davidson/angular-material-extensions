import { TemplateRef } from '@angular/core';
import { TableBuilder } from './table-builder';
import { MatColumnDef } from '@angular/material/table';
import { ColumnTemplates } from '../interfaces/column-template';
import { MetaData, FieldType } from '../interfaces/report-def';
import { Observable } from 'rxjs';
import { filterArray, mapArray } from '../functions/rxjs-operators';
import { map, shareReplay } from 'rxjs/operators';
import { CustomCellDirective } from '../directives/custom-cell-directive';
import * as _ from 'lodash';

export class TableTemplateBuilder {
  constructor(
    private tableBuilder: TableBuilder,
    private headerTemplate: TemplateRef<any>,
    private bodyTemplate: TemplateRef<any>,
    private footerTemplate: TemplateRef<any>,
    private columnDefs: MatColumnDef[],
    private customCells: CustomCellDirective[]) {}

    createTemplatesFromMetaData(metaData: MetaData): ColumnTemplates {
      return {
        header: this.headerTemplate,
        footer: this.footerTemplate,
        body: this.bodyTemplate,
        metaData
      };
    }

    getColumnNames(): Observable<string[]> {
      return this.getColumnTemplates().pipe(
        filterArray(tmplt => tmplt.metaData.fieldType !== FieldType.Hidden),
        map(templates  =>  _.orderBy(templates, 'metaData.order' ).map( t => t.metaData.key )   ),
      );
    }

    getColumnTemplates(): Observable<ColumnTemplates[]> {
      return  this.tableBuilder.metaData$.pipe(
        mapArray(metaData => this.createTemplatesFromMetaData(metaData)),
        map( ct => [
          ...ct,
          ...this.customCells.map( cc => this.createTemplatesFromCustomCell(cc)),
          ...this.columnDefs
            .filter( cd =>  this.customCells.findIndex( cc => cc.customCell === cd.name ) === -1 )
            .map(cd => this.createTemplatesFromMatColumnDef(cd)),
        ]),
        shareReplay(1)
      );
    }

    createTemplatesFromMatColumnDef(def: MatColumnDef): ColumnTemplates {
      return  {
        header: def.headerCell ? def.headerCell.template : this.headerTemplate,
        footer: def.footerCell ? def.footerCell.template : this.footerTemplate,
        body: def.cell.template,
        metaData: {
          key: def.name,
          fieldType: FieldType.Unknown
        }
      };
    }

    createTemplatesFromCustomCell(cc: CustomCellDirective): ColumnTemplates {
      return {
        header: this.headerTemplate,
        footer: this.footerTemplate,
        body: cc.TemplateRef,
        metaData: {
          key: cc.customCell,
          fieldType: FieldType.Unknown,
          order: cc.customCellOrder
        }
      };
    }
}

