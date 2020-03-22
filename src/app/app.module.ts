import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableBuilderModule } from '../../projects/table-builder/src/lib/table-builder.module';
import { TableBuilderExampleComponent } from './table-builder-example/table-builder-example.component';
import { MatTableModule } from '@angular/material/table';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    AppComponent,
    TableBuilderExampleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCheckboxModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    TableBuilderModule.forRoot({ defaultTableState: { pageSize: 20}}),
    MatTableModule,
    StoreDevtoolsModule.instrument({maxAge:50}),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
