import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Iuser } from '../interfaces/iuser';
import { Ibus } from '../interfaces/ibus';
import { IBookUser } from '../interfaces/i-book-user';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private profile = new BehaviorSubject<Iuser | undefined>(undefined);
  profile$ = this.profile.asObservable();

  private bookBus  = new BehaviorSubject<Ibus | undefined>(undefined);
  bookBus$ = this.bookBus.asObservable();

  private bookUser  = new BehaviorSubject<IBookUser | undefined>(undefined);
  bookUser$ = this.bookUser.asObservable();

  private bus = new BehaviorSubject<Ibus | undefined>(undefined);
  bus$ = this.bus.asObservable();
  
  private seat = new BehaviorSubject<number[] | undefined>(undefined);
  seat$ = this.seat.asObservable();

  setseatData(value: number[]) {
    this.seat.next(value);
  }

  setbookUserData(value: IBookUser) {
    this.bookUser.next(value);
  }

  setProfileData(value: Iuser) {
    this.profile.next(value);
  }

  setBookBusData(value: Ibus) {
    this.bookBus.next(value);
  }

  setBusData(value: Ibus) {
    this.bus.next(value);
  }

}
