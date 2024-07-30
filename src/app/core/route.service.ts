import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { IrouteGetResponse } from './interfaces/iroute-get-response';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Iroute } from './interfaces/iroute.interface';
import { IrouteCreateResponse } from './interfaces/iroute-create-response';
import { IDeleteApiResponse } from './interfaces/idelete-api-response';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  constructor(
    private http : HttpClient
  ) { }

  getAll(): Observable<IrouteGetResponse> {
    return this.http.get<IrouteGetResponse>('/route/getAll' ,).pipe(

      catchError((error) => {
        Swal.fire({
          icon: "error",
          text: error.message || 'An error occurred',
          title : "Error",
          showConfirmButton : false,
          timer: 2000
        });
        throw error;
      })
    );
  }

  getRoutebyId(id : string): Observable<IrouteGetResponse> {
    return this.http.get<IrouteGetResponse>(`/route/getbyid/${id}`).pipe(

      catchError((error) => {
        Swal.fire({
          icon: "error",
          title : "Error",
          text: error.message || 'An error occurred',
          showConfirmButton : false,
          timer: 2000
        });
        throw error;
      })
    );
  }




  createRoute(updateData: Iroute): Observable<IrouteCreateResponse> {
    return this.http.post<IrouteCreateResponse>('/route/create', updateData).pipe(
      tap((resdata: IrouteCreateResponse) => {
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

  deleteRoute(id: string): Observable<IDeleteApiResponse> {
    return this.http.delete<IDeleteApiResponse>(`/route/delete/${id}`).pipe(
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

  updateRoute(updateData: Iroute): Observable<IrouteCreateResponse> {
    return this.http.put<IrouteCreateResponse>(`/route/update/${updateData._id}`, updateData).pipe(
      tap((resdata: IrouteCreateResponse) => {
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
