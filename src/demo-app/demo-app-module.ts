import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  MdButtonModule, MdIconModule, MdListModule, MdSidenavModule, MdToolbarModule
} from '@angular/material';

import { MdCalendarModule } from '@material2-extra/calendar';
import { MdMasonryModule } from '@material2-extra/masonry';

import { DEMO_APP_ROUTES } from './demo-app/routes';
import { DemoApp, Home } from './demo-app/demo-app';
import { CalendarDemo } from './calendar/calendar-demo';
import { MasonryDemo } from './masonry/masonry-demo';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(DEMO_APP_ROUTES),
    BrowserAnimationsModule,

    MdButtonModule,
    MdIconModule,
    MdListModule,
    MdSidenavModule,
    MdToolbarModule,

    MdCalendarModule,
    MdMasonryModule
  ],
  declarations: [
    DemoApp,
    Home,
    CalendarDemo,
    MasonryDemo
  ],
  entryComponents: [
    DemoApp
  ]
})
export class DemoAppModule {
  constructor(private _appRef: ApplicationRef) { }

  ngDoBootstrap() {
    this._appRef.bootstrap(DemoApp);
  }
}
