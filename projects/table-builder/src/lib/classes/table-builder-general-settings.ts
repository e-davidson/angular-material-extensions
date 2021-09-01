import { merge } from "lodash";

export class GeneralTableSettings {
  constructor(settings? : TableBuilderSettings){
    if(settings){
      merge(this.headerSettings,settings.headerSettings);
      merge(this.footerSettings,settings.footerSettings);
    }
  }
  headerSettings = new TableWrapperHeaderSettings();
  footerSettings = new TableWrapperFooterSettings();
}

export interface TableBuilderSettings {
  headerSettings? : Partial<TableWrapperHeaderSettings>;
  footerSettings? : Partial<TableWrapperFooterSettings>;
}

export class TableWrapperHeaderSettings {
  hideExport = false
  hideFilter = false
  hideColumnSettings = false
  hideSort = false
  collapse = false
  showTitleWhenCollapsed = true;
}

export class TableWrapperFooterSettings {
  collapse = false
}

export class PesrsistedTableSettings {
  constructor(tableSettings? :GeneralTableSettings){
    if(tableSettings){
      this.collapseHeader = tableSettings.headerSettings.collapse;
      this.collapseFooter = tableSettings.footerSettings.collapse;
    }
  }
  collapseHeader : boolean;
  collapseFooter : boolean;
}

export class NotPersisitedTableSettings {
  constructor(tableSettings? :GeneralTableSettings){
    if(tableSettings){
      this.hideExport = tableSettings.headerSettings.hideExport;
      this.hideColumnSettings = tableSettings.headerSettings.hideColumnSettings;
      this.hideFilter = tableSettings.headerSettings.hideFilter;
      this.hideSort = tableSettings.headerSettings.hideSort;
      this.showTitleWhenHeaderCollapsed = tableSettings.headerSettings.showTitleWhenCollapsed;
    }
  }
  hideExport = true
  hideFilter = true
  hideColumnSettings = true
  hideSort = true
  showTitleWhenHeaderCollapsed = true;
}