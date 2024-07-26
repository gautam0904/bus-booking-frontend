import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { IseatgetApiResponse } from '../interfaces/iseatget-api-response';
import { Ibus } from '../interfaces/ibus';
import Swal from 'sweetalert2';
import { IbookingSeat } from '../interfaces/ibooking-seat';
import { IbookingSeatgetApiResponse } from '../interfaces/ibooking-seatget-api-response';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient, private router: Router) { }

  bookedseat(busdata: Ibus , date : Date): Observable<IseatgetApiResponse> {

    if (!busdata) {
      throw Error;
    }

    return this.http.post<IseatgetApiResponse>(`/bus/bookedSeat/`, {
      departure: busdata.departure,
      destination: busdata.destination,
      busId: busdata._id || '',
      date : date
    }).pipe(

      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || 'An error occurred',
          showConfirmButton: false,
          timer: 1500
        });
        this.router.navigate([''])
        throw error;
      })
    );
  }


  getbookseat(seatdata: IbookingSeat): Observable<IbookingSeatgetApiResponse> {
    
    return this.http.post<IbookingSeatgetApiResponse>('/bus/book/', seatdata).pipe(

      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || 'An error occurred',
          showConfirmButton: false,
          timer: 1500
        });
        throw error;
      })
    );
  }
}
