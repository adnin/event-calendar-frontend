import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private apiService: ApiService) { }

  create(payroll: any): Observable<any> {
    return this.apiService
    .post(`/events`, payroll)
    .pipe(
        map((body: any) => body)
      );
  }

  all(): Observable<any> {
    return this.apiService
    .get(`/events`)
    .pipe(
        map((body: any) => body)
      );
  }
}
