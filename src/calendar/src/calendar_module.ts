import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material';

import { MdeCalendar } from './calendar/index';


@NgModule({
  imports: [CommonModule, MatButtonModule],
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
