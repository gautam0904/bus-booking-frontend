import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Ibus } from 'src/app/core/interfaces/ibus';
import { IbusgetApiResponse } from 'src/app/core/interfaces/ibusget-api-response';
import { BusService } from 'src/app/core/services/bus.service';
import { SharedService } from 'src/app/core/services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-search-bus',
  templateUrl: './search-bus.component.html',
  styleUrls: ['./search-bus.component.scss']
})
export class SearchBusComponent {
  searchBusForm!: FormGroup;
  role !: string;
  isedit = false;
  searching = false;
  showform = true;
  buses: Ibus[] = [];
  cloneBus: Ibus | undefined;
  minDate!: string;
  loading: boolean = false;
  selectedBus!: Ibus;
  private subscription: Subscription = new Subscription();
  dataSource!: [{ previousStation: string; currentStation: string; distance: number; arrivalTime: string; }];

  constructor(
    private busService: BusService,
    private sharedService: SharedService,
    private router: Router,
    private fb: FormBuilder,
  ){
   
    this.searchBusForm = this.fb.group({
      departure: ['', Validators.required],
      destination: ['', Validators.required],
      bookingDate: ['', Validators.required],
      seat: ['', Validators.required],
      isSingleLady: ['']
    });
  }

  ngOnInit(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    }

  onbusUpdate(bus: Ibus) {
    this.sharedService.setBusData(bus);
    this.router.navigate(['/add-bus']);
  }

  singleLady(e: MatCheckboxChange) {
    if (e.checked) {
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
        stops : bus.stops,
        departureTime: new Date().toISOString()
      }
      this.sharedService.setBookBusData(bookedbus)
      this.searching = false
      this.router.navigate(['/bus-book']);
    }
  }

  selectBus(bus: Ibus) {
    this.selectedBus = bus;
    
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
      
    }
    else {
      Object.values(this.searchBusForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }

  }

}

