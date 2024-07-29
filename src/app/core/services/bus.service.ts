import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { IbusgetApiResponse } from '../interfaces/ibusget-api-response';
import { Ibus } from '../interfaces/ibus';
import { IbusCreateApiResponse } from '../interfaces/ibus-create-api-response';
import { IDeleteApiResponse } from '../interfaces/idelete-api-response';

@Injectable({
  providedIn: 'root'
})
export class BusService {

  constructor(private http: HttpClient) { }

  getBusbyId(id : string): Observable<IbusgetApiResponse> {
    return this.http.get<IbusgetApiResponse>(`/buses/getbyid/${id}`).pipe(

      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || 'An error occurred',
          showConfirmButton : false,
          timer: 2000
        });
        throw error;
      })
    );
  }

  getAll(): Observable<IbusgetApiResponse> {
    return this.http.get<IbusgetApiResponse>('/buses/getAll' ,).pipe(

      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || 'An error occurred',
          showConfirmButton : false,
          timer: 2000
        });
        throw error;
      })
    );
  }




  getBusbyFilter(busdata : Ibus): Observable<IbusgetApiResponse> {
    return this.http.get<IbusgetApiResponse>('/buses/get' , { params :{
      departure: busdata.departure.toLowerCase(),
      destination: busdata.destination.toLowerCase(),
    }}).pipe(

      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || 'An error occurred',
          showConfirmButton : false,
          timer: 2000
        });
        throw error;
      })
    );
  }

  createBus(updateData: Ibus): Observable<IbusCreateApiResponse> {
    console.log(updateData);
    
    return this.http.post<IbusCreateApiResponse>('/buses/create', updateData).pipe(
      tap((resdata: IbusCreateApiResponse) => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: resdata.message,
        });
      }),
      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || 'An error occurred',
        });
        throw error;
      })
    );
  }

  deleteBus(id: string): Observable<IDeleteApiResponse> {
    return this.http.delete<IDeleteApiResponse>(`/buses/delete/${id}`).pipe(
      tap((resdata: IDeleteApiResponse) => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: resdata.message,
        });
      }),
      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || 'An error occurred',
        });
        throw error;
      })
    );
  }

  updateBus(updateData: Ibus): Observable<IbusCreateApiResponse> {
    return this.http.put<IbusCreateApiResponse>(`/buses/update/${updateData._id}`, updateData).pipe(
      tap((resdata: IbusCreateApiResponse) => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: resdata.message,
        });
      }),
      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || 'An error occurred',
        });
        throw error;
      })
    );
  }
}
