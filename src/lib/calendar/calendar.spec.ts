import { async, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { MdCalendar, MdCalendarPeriod, MdCalendarModule } from './calendar';

import * as moment from 'moment';


describe('MdCalendar', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, MdCalendarModule],
      declarations: [MdCalendarBasicTestComponent, MdCalendarMonthViewTestComponent]
    });
    TestBed.compileComponents();
  }));

  describe('basic behaviors', () => {
    it('creates an action header and entry rows', () => {
      let fixture = TestBed.createComponent(MdCalendarBasicTestComponent);
      fixture.detectChanges();

      let calendarItem = fixture.debugElement.query(By.directive(MdCalendar));
      expect(calendarItem.query(By.css('.md-calendar-header'))).toBeTruthy();
      expect(calendarItem.query(By.css('.md-calendar-row'))).toBeTruthy();
    });

    it('should display the current month', () => {
      let fixture = TestBed.createComponent(MdCalendarBasicTestComponent);
      fixture.detectChanges();

      let calendarItem = fixture.debugElement.query(By.directive(MdCalendar));
      let calendarRows = calendarItem.queryAll(By.css('.md-calendar-row'));

      let startDate = moment().startOf('month').startOf('week');
      let endDate = moment().endOf('month').endOf('week').add(1, 'day');
      expect(calendarRows.length).toBe(endDate.diff(startDate, 'weeks') + 1);

      let curDate = startDate.clone();
      let rowIdx = 1;
      let colIdx = 0;
      let curRow = calendarRows[rowIdx];
      while (curRow != null && curDate.isBefore(endDate)) {
        if (colIdx >= curRow.children.length) {
          curRow = calendarRows[++rowIdx];
          colIdx = 0;
        }
        if (curRow != null) {
          expect(
            parseInt(
              curRow
                .children[colIdx]
                .query(By.css('.md-button-wrapper')).nativeElement.innerHTML,
              10
            )
          ).toBe(curDate.date());
          colIdx++;
          curDate.add(1, 'day');
        }
      }
    });

    it('supports ngModel', (done: () => void) => {
      let fixture = TestBed.createComponent(MdCalendarBasicTestComponent);
      fixture.detectChanges();

      let instance = fixture.componentInstance;
      let component = fixture.debugElement.query(By.directive(MdCalendar)).componentInstance;

      let curDate = new Date();
      instance.model = <MdCalendarPeriod>{
        type: 'day',
        startDate: curDate,
        endDate: curDate
      };

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        let selected = fixture.debugElement.queryAll(By.css('button.md-warn'));
        expect(selected.length).toEqual(1);
        expect(parseInt(selected[0].nativeElement.children[0].innerHTML, 10))
          .toEqual(curDate.getDate());

        curDate = moment(curDate).add(1, 'day').toDate();
        component.value = <MdCalendarPeriod>{
          type: 'day',
          startDate: curDate,
          endDate: curDate
        };

        fixture.detectChanges();

        selected = fixture.debugElement.queryAll(By.css('button.md-warn'));
        expect(selected.length).toEqual(1);
        expect(parseInt(selected[0].nativeElement.children[0].innerHTML, 10))
          .toEqual(curDate.getDate());
        done();
      });
    });
  });

  describe('year view', () => {
    it('should display the current year', (done: () => void) => {
      let fixture = TestBed.createComponent(MdCalendarMonthViewTestComponent);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        let calendarItem = fixture.debugElement.query(By.directive(MdCalendar));
        let calendarRows = calendarItem.queryAll(By.css('.md-calendar-row'));

        let startDate = moment().startOf('year');
        let endDate = moment().endOf('year').add(1, 'day');
        let totalEntries = 0;
        for (let i = 0 ; i < calendarRows.length ; i++) {
          totalEntries += calendarRows[i].queryAll(By.css('button')).length;
        }
        expect(totalEntries).toBe(12);

        let curDate = startDate.clone();
        let rowIdx = 0;
        let colIdx = 0;
        let curRow = calendarRows[rowIdx];
        while (curRow != null && curDate.isBefore(endDate)) {
          if (colIdx >= curRow.children.length) {
            curRow = calendarRows[++rowIdx];
            colIdx = 0;
          }
          if (curRow != null) {
            expect(curRow.children[colIdx]
              .query(By.css('.md-button-wrapper')).nativeElement.innerHTML.trim())
              .toBe(curDate.format('MMM'));
            colIdx++;
            curDate.add(1, 'month');
          }
        }

        done();
      });
    });
  });
});

@Component({
  selector: 'md-calendar-test-component',
  template: `<md-calendar [(ngModel)]="model"></md-calendar>`
})
class MdCalendarBasicTestComponent {
  model: MdCalendarPeriod;
}

@Component({
  selector: 'md-calendar-test-component',
  template: `<md-calendar view-mode="year"></md-calendar>`
})
class MdCalendarMonthViewTestComponent {
}
