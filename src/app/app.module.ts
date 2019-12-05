import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableBuilderModule } from '../../projects/table-builder/src/lib/table-builder.module';
import { TableBuilderExampleComponent } from './table-builder-example/table-builder-example.component';
import { MatTableModule } from '@angular/material/table';
import { StoreModule } from '@ngrx/store';

@NgModule({
  declarations: [
    AppComponent,
    TableBuilderExampleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TableBuilderModule.forRoot({ defaultTableState: { pageSize: 20}}),
    StoreModule.forRoot({}),
    MatTableModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
