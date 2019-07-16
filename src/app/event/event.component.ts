import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGrigPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // for dateClick
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { untilDestroyed } from '../core';
import { finalize, map } from 'rxjs/operators';
import { EventService } from './shared/event.service';
import { ToastOptions, ToastData, ToastyService } from 'ng2-toasty';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit, OnDestroy {

  error: string | undefined;
  eventForm!: FormGroup;
  isLoading = false;

  @ViewChild('form') form;

  days = [
    {name: 'Monday', value: false},
    {name: 'Tuesday', value: false},
    {name: 'Wednesday', value: false},
    {name: 'Thursday', value: false},
    {name: 'Friday', value: false},
    {name: 'Saturday', value: false},
    {name: 'Sunday', value: false},
  ]

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template

  calendarVisible = true;
  calendarPlugins = [dayGridPlugin, timeGrigPlugin, interactionPlugin];
  calendarWeekends = true;
  calendarEvents: EventInput[] = [];

  position = 'bottom-right';
  title: string;
  msg: string;
  showClose = true;
  theme = 'bootstrap';
  type = 'default';
  closeOther = false;

  constructor(
    private router: Router, 
    private formBuilder: FormBuilder, 
    private eventService: EventService,
    private toastyService: ToastyService
    ) {
    this.createForm();
  }

  ngOnInit(): void {this.getAll()}

  ngOnDestroy(): void {}

  getAll() {
    this.eventService.all()
    .pipe(untilDestroyed(this))
    .subscribe((data: any) => { 
      data.eventDates.forEach(date => {
        if(this.eventForm.valid) {
          if(date['title'] == this.eventForm.value.name) {
            this.calendarEvents = this.calendarEvents.concat({ 
              title: date['title'],
              start: new Date(date['start']),
            })
          }
        } else {
          this.calendarEvents = this.calendarEvents.concat({ 
            title: date['title'],
            start: new Date(date['start']),
          })
        }
      });
    });
  }

  removeSelectedEvent() {
    this.calendarEvents = this.calendarEvents.filter(events => events.title.toLowerCase() != this.eventForm.value.name.toLowerCase());
  }

  createEvent() {
    if (this.eventForm.valid) {
      this.removeSelectedEvent();
      this.isLoading = true;
      this.eventForm.value['days'] = this.days;
      this.eventService.create(this.eventForm.value).pipe(
        finalize(() => {
          this.eventForm.markAsPristine();
        }),
        untilDestroyed(this)
      )
      .subscribe(
        () => {
          this.saveNotif();
          this.getAll();
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
          //log.debug(`Login error: ${error}`);
        }
      );
    }
  }

  private createForm() {
    this.eventForm = this.formBuilder.group({
      name: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required]
    });
  }

  checkIfHasDay() {
    var found = false;
    for(var i = 0; i < this.days.length; i++) {
        if (this.days[i].value) {
            found = true;
            break;
        }
    }
    return found;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  saveNotif() {
    let notif = {
      title:'Event successfully saved', 
      showClose: true, 
      timeout: 5000, 
      theme:'bootstrap', 
      type:'success', 
      position:'top-center', 
      closeOther:true,
    }
    this.addToast(notif);
  }

  addToast(options) {
    if (options.closeOther) {
      this.toastyService.clearAll();
    }
    this.position = options.position ? options.position : this.position;
    const toastOptions: ToastOptions = {
      title: options.title,
      msg: options.msg,
      showClose: options.showClose,
      timeout: options.timeout,
      theme: options.theme,
      onAdd: (toast: ToastData) => {
        /* added */
      },
      onRemove: (toast: ToastData) => {
        /* removed */
      }
    };

    switch (options.type) {
      case 'default': this.toastyService.default(toastOptions); break;
      case 'info': this.toastyService.info(toastOptions); break;
      case 'success': this.toastyService.success(toastOptions); break;
      case 'wait': this.toastyService.wait(toastOptions); break;
      case 'error': this.toastyService.error(toastOptions); break;
      case 'warning': this.toastyService.warning(toastOptions); break;
    }
  }
}
