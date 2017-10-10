import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule,
  MATERIAL_COMPATIBILITY_MODE
} from '@angular/material';

import { MdeCalendarModule } from '@material2-extra/calendar';
import { MdeMasonryModule } from '@material2-extra/masonry';

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

    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,

    MdeCalendarModule,
    MdeMasonryModule
  ],
  declarations: [
    DemoApp,
    Home,
    CalendarDemo,
    MasonryDemo
  ],
  entryComponents: [
    DemoApp
  ],
  providers: [
    {provide: MATERIAL_COMPATIBILITY_MODE, useValue: true}
  ]
})
export class DemoAppModule {
  constructor(private _appRef: ApplicationRef) { }

  ngDoBootstrap() {
    this._appRef.bootstrap(DemoApp);
  }
}
