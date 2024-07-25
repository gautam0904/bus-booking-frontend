import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Ibus } from 'src/app/core/interfaces/ibus';
import { IbusgetApiResponse } from 'src/app/core/interfaces/ibusget-api-response';
import { BusService } from 'src/app/core/services/bus.service';
import { SharedService } from 'src/app/core/services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  role !: string;
  isedit = false;
  searching = false;
  showform = false;
  searchBusForm!: FormGroup;
  buses: Ibus[] = [];
  cloneBus: Ibus | undefined;
  loading: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private busService: BusService,
    private sharedService: SharedService,
  ) {
    this.role = JSON.parse(localStorage.getItem('user') as string)?.role || "";
    this.searchBusForm = this.fb.group({
      departure: ['', Validators.required],
      destination: ['', Validators.required],
      bookingDate: ['', Validators.required],
      seat: ['', Validators.required],
      isSingleLady: ['']
    });
  }

  ngOnInit(): void {
    this.busService.getAll().subscribe({
      next: (resdata: IbusgetApiResponse) => {
        this.loading = false;
        this.searching = false;
        if (resdata.data instanceof Array) {
          this.buses = resdata.data;
        } else {
          this.buses = [resdata.data];
        }
      },
      error: (err) => {
        this.loading = false;

      }
    })
  }

  addbus() {
    this.router.navigate(['/add-bus']);
  }
  onbusUpdate(bus: Ibus) {
    this.sharedService.setBusData(bus);
    this.router.navigate(['/add-bus']);
  }

  singleLady(e: any) {
    if (e.target.checked) {
      this.searchBusForm.patchValue({
        seat: 1
      })
      this.searchBusForm.get('seat')?.disable()
    }
    else {
      this.searchBusForm.patchValue({
        seat: ""
      })
      this.searchBusForm.get('seat')?.enable()
    }
  }

  ondelete(bus: Ibus) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed && bus._id) {
        this.busService.deleteBus(bus._id).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success"
            });
            this.ngOnInit();
          },
          error: (err) => {
            this.loading = false;
          }
        })

      }
    });
  }


  bookBus(bus: Ibus) {
    if (this.searchBusForm) {
      const bookedbus: Ibus = {
        _id: bus._id,
        busNumber: bus.busNumber,
        TotalSeat: bus.TotalSeat,
        departure: this.searchBusForm.get('departure')?.value,
        destination: this.searchBusForm.get('destination')?.value,
        charge: bus.charge,
        route: bus.route,
        departureTime: new Date().toISOString()
      }
      this.sharedService.setBookBusData(bookedbus)
      this.searching = false
      this.router.navigate(['/bus-book']);
    }
  }

  onSubmit() {

    this.searching = true;
    
    if (this.searchBusForm.get('departure')?.valid && this.searchBusForm.get('destination')?.valid && this.searchBusForm.get('bookingDate')?.valid) {
      this.sharedService.setbookUserData({  
        seat : this.searchBusForm.get('seat')?.value,
        isSingleLady : this.searchBusForm.get('isSingleLady')?.value,
        bookingDate : this.searchBusForm.get('bookingDate')?.value
      });

      this.loading = true;
      this.showform = false;
      this.searching = true;
      setTimeout(() => {
        const submitObservable = this.busService.getBusbyFilter(this.searchBusForm.value);

        this.subscription.add(
          submitObservable.subscribe({
            next: (resdata: IbusgetApiResponse) => {
              this.loading = false;
              if (resdata.data instanceof Array) {
                this.buses = resdata.data;
              } else {
                this.buses = [resdata.data];
              }
            },
            error: (err) => {
              this.loading = false;

            }
          })
        );
      }, 1000);
    }
    else {
      Object.values(this.searchBusForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }

  }

}
