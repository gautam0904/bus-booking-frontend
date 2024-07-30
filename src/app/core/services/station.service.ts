import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { IstaionGetApiresponse } from '../interfaces/istaion-get-apiresponse';
import { Istation } from '../interfaces/istation';
import { IstaionCreateApiresponse } from '../interfaces/istaion-create-apiresponse';
import { IDeleteApiResponse } from '../interfaces/idelete-api-response';

@Injectable({
  providedIn: 'root'
})
export class StationService {

  constructor(
    private http : HttpClient
  ) { }
  


  getAll(): Observable<IstaionGetApiresponse> {
    return this.http.get<IstaionGetApiresponse>('/station/getAll' ,).pipe(

      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Error...",
          text: error.message || 'An error occurred',
          showConfirmButton : false,
          timer: 2000
        });
        throw error;
      })
    );
  }




  getstationbyFilter(stationdata : Istation): Observable<IstaionGetApiresponse> {
    return this.http.get<IstaionGetApiresponse>('/station/get' , { params :{
     stattion : stationdata.station.toLowerCase(),
    }}).pipe(

      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Error...",
          text: error.message || 'An error occurred',
        });
        throw error;
      })
    );
  }

  createstation(updateData: Istation): Observable<IstaionCreateApiresponse> {
    console.log(updateData);
    
    return this.http.post<IstaionCreateApiresponse>('/station/create', updateData).pipe(
      tap((resdata: IstaionCreateApiresponse) => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: resdata.message,
          showConfirmButton: false,
          timer: 2000
        });
      }),
      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Error...",
          text: error.message || 'An error occurred',
        });
        throw error;
      })
    );
  }

  deletestation(id: string): Observable<IDeleteApiResponse> {
    return this.http.delete<IDeleteApiResponse>(`/station/delete/${id}`).pipe(
     
      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Error...",
          text: error.message || 'An error occurred',
        });
        throw error;
      })
    );
  }

  updatestation(updateData: Istation): Observable<IstaionCreateApiresponse> {
    return this.http.put<IstaionCreateApiresponse>(`/station/update/${updateData._id}`, updateData).pipe(
      
      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Error...",
          text: error.message || 'An error occurred',
        });
        throw error;
      })
    );
  }
}
