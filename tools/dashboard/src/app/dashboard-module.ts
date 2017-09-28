import {BrowserModule} from '@angular/platform-browser';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {NgModule} from '@angular/core';
import {DashboardApp} from './dashboard-app';
import {environment} from '../environments/environment';
import {MdToolbarModule} from '@angular/material';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PayloadChart} from './payload-chart/payload-chart';

@NgModule({
  exports: [
    MdToolbarModule
  ]
})
export class DashboardMaterialModule {}

@NgModule({
  declarations: [
    DashboardApp,
    PayloadChart
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    DashboardMaterialModule,
    NgxChartsModule
  ],
  providers: [],
  bootstrap: [DashboardApp]
})
export class DashboardModule {}
