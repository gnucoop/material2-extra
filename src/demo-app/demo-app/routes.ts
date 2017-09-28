import { Routes } from '@angular/router';
import { Home } from './demo-app';

import { CalendarDemo } from '../calendar/calendar-demo';
import { MasonryDemo } from '../masonry/masonry-demo';


export const DEMO_APP_ROUTES: Routes = [
  { path: '', component: Home },
  { path: 'calendar', component: CalendarDemo },
  { path: 'masonry', component: MasonryDemo }
];
