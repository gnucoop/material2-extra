import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MdButtonModule } from '@angular/material';

import { MdCalendar } from './calendar/index';


@NgModule({
  imports: [CommonModule, MdButtonModule],
  exports: [MdCalendar],
  declarations: [MdCalendar],
  providers: []
})
export class MdCalendarModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdCalendarModule,
      providers: []
    };
  }
}
