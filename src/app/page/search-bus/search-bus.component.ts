import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
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
  getAll = false;
  private subscription: Subscription = new Subscription();
  dataSource!: [{ previousStation: string; currentStation: string; distance: number; arrivalTime: string; }];

  constructor(
    private busService: BusService,
    private sharedService: SharedService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ){
   
    this.searchBusForm = this.fb.group({
      departure: ['', Validators.required],
      destination: ['', Validators.required],
      bookingDate: ['', [Validators.required, this.dateNotPastValidator()]],
      seat: ['', Validators.required],
      isSingleLady: ['']
    });
    
  }

  ngOnInit(): void {
    const today = new Date();

    this.minDate = today.toISOString().split('T')[0];

    this.route.paramMap.subscribe((params: { get: (arg0: string) => any; }) => {
     this.getAll = params.get('getAll');
    });

    this.role = JSON.parse(localStorage.getItem("user") as string).role;

    if(this.getAll){
      this.showform = false;
      this.loading = true;

      this.busService.getAll().subscribe({
        next: (res: IbusgetApiResponse) => {
          this.buses = res.data as Ibus[];
        },
        complete: () => {
          this.loading = false;
        }
      })
    }
 
    }

  onbusUpdate(bus: Ibus) {
    this.sharedService.setBusData(bus);
    this.router.navigate(['/add-bus']);
  }

  dateNotPastValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const today = new Date();
      const selectedDate = new Date(control.value);
  
      return selectedDate < today
        ? { 'datePast': 'The booking date cannot be in the past' }
        : null;
    };
  }

  getDepartureTime(bus: Ibus): string {
    const departure = this.searchBusForm.get('departure')?.value || bus.departure;
    const stop = bus.stops.find((st) => st.stationName === departure);
    return stop?.arrivalTime || '';
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
        departureTime: bus.stops.find(st => st.stationName === this.searchBusForm.get('departure')?.value )?.arrivalTime || ""
      }
      console.log(bookedbus);
      
      this.sharedService.setBookBusData(bookedbus)
      this.searching = false
      this.router.navigate(['/bus-book']);
    }
  }

  selectBus(bus: Ibus) {
    console.log(bus);
    
    this.selectedBus = bus;
  }

  onSubmit() {

    this.searching = true;
    
    if (this.searchBusForm.get('departure')?.valid && this.searchBusForm.get('destination')?.valid && this.searchBusForm.get('bookingDate')?.valid) {
      this.searchBusForm.patchValue({
        departure : this.busService.toCamelCase(this.searchBusForm.get('departure')?.value),
        destination : this.busService.toCamelCase(this.searchBusForm.get('destination')?.value)
      })
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

