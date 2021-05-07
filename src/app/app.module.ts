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
import { MatSelectModule } from '@angular/material/select';
import { LowerCasePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    TableBuilderExampleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCheckboxModule,
    MatSelectModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({},{
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
        strictStateSerializability: false,
        strictActionSerializability: false,
        strictActionWithinNgZone: false,
        strictActionTypeUniqueness: false,
      },
    }),
    EffectsModule.forRoot([]),
    TableBuilderModule.forRoot({
      defaultSettings: { dateFormat: 'short' },
      defaultTableState: { pageSize: 20 },
    }),
    MatTableModule,
    StoreDevtoolsModule.instrument({maxAge:50}),
  ],
  providers: [LowerCasePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
