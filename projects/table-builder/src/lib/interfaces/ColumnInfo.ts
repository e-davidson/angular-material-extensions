import { CustomCellDirective } from "../directives/custom-cell-directive";
import { MetaData } from "./report-def";

export interface ColumnInfo {
  metaData: MetaData;
  customCell: CustomCellDirective;
}
