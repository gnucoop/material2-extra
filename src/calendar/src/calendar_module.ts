import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MdButtonModule } from '@angular/material';

import { MdeCalendar } from './calendar/index';


@NgModule({
  imports: [CommonModule, MdButtonModule],
  exports: [MdeCalendar],
  declarations: [MdeCalendar],
  providers: []
})
export class MdeCalendarModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdeCalendarModule,
      providers: []
    };
  }
}
