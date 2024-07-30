import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Iuser } from '../interfaces/iuser';
import { catchError, Observable, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { IuserGetApiResponse } from '../interfaces/iuser-get-api-response';
import { IDeleteApiResponse } from '../interfaces/idelete-api-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }
  login(loginData: Iuser) {
    return this.http.post<IuserGetApiResponse>('/user/login', {
      "email": loginData.email,
      "password": loginData.password
    }).pipe(
      tap((resdata: IuserGetApiResponse) => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: resdata.message,
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
    )
  }

  update(updateData: Iuser) {
  
      return this.http.put<IuserGetApiResponse>('/user/update', updateData).pipe(
        tap((resdata: IuserGetApiResponse) => {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: resdata.message,
          });
        }),
        catchError((error) => {
          Swal.fire({
            icon: "error",
            title: "Error...",
            text: error.error.message || 'An error occurred',
          });
          throw error;
        })
      )
  
  }

  signup(signupData: Iuser): Observable<IuserGetApiResponse> {
    return this.http.post<IuserGetApiResponse>('/user/signup' ,signupData).pipe(
      tap((resdata: IuserGetApiResponse) => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: resdata.message,
        });
      }),
      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Error...",
          text: error.error.message || 'An error occurred',
        });
        throw error;
      })
    )
  }

  getAllusers(): Observable<IuserGetApiResponse> {
    return this.http.get<IuserGetApiResponse>('/user/getAll').pipe(
      catchError((error) => {
        Swal.fire({
          icon: "error",
          title: "Error...",
          text: error.error.message || 'An error occurred',
        });
        throw error;
      })
    );
  }

  deleteUser(userId: string): Observable<IDeleteApiResponse>{
    return this.http.delete<IDeleteApiResponse>(`/user/delete/${userId}`).pipe(
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
          title: "Error...",
          text: error.message || 'An error occurred',
        });
        throw error;
      })
    );
  }
}
