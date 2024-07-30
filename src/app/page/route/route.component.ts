import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { IrouteGetResponse } from 'src/app/core/interfaces/iroute-get-response';
import { Iroute } from 'src/app/core/interfaces/iroute.interface';
import { RouteService } from 'src/app/core/route.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.scss']
})
export class RouteComponent implements OnInit {
  routes!: Iroute[];
  loading = false;
  isShowForm = false;
  role! : string ;
  selectedRoute !:Iroute
  routeForm!: FormGroup;
  isedit = false;
  clonedRoute:  Iroute | undefined;
  private subscription: Subscription = new Subscription();
  
  constructor(
    private routeService: RouteService,
    private messageService: MessageService,
    private fb : FormBuilder,
    private router: Router
  ){
    this.role = JSON.parse(localStorage.getItem('user') as string).role;
    this.routeForm = this.fb.group({
      _id: [""],
      roteName: ['', [Validators.required, Validators.pattern('^[A-Z][ - ][A-Z]$')]],
      stations: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.routeService.getAll().subscribe({
      next: (res : IrouteGetResponse) =>{
        this.routes = res.data as Iroute[];
      },
    })
  }

  get stationArray() {
    return (this.routeForm.get('station') as FormArray);
  }

  createStation(): FormGroup {
    if (this.stationArray.length == 0) {
      return this.fb.group({
        station: [{ value: this.busForm.value.departure , disabled: true }, Validators.required],
        currentStation: ['', Validators.required],
        distance: ['', Validators.required],
      });
    } else {
      return this.fb.group({
        previousStation: [{ value : this.busForm.value.route[this.routeArray.length - 1].currentStation , disabled: true}, Validators.required],
        currentStation: ['', Validators.required],
        distance: ['', Validators.required],
      });
      
    }
  }

  addRoute() {
    
    if (this.routeArray.valid && this.busForm.controls['busNumber'].valid && this.busForm.controls['departure'].valid && this.busForm.controls['departureTime'].valid && this.busForm.controls['TotalSeat'].valid && this.busForm.controls['charge'].valid) {


      this.routeArray.push(this.createRoute());

      if (this.routeArray.length == 1) {
        this.routeArray.at(this.routeArray.length - 1).patchValue({
          previousStation: this.busForm.value.departure
        });
       
      } else {        
        this.routeArray.at(this.routeArray.length - 1).patchValue({
          previousStation: this.busForm.value.route[this.routeArray.length - 2].currentStation
        });
      }
    } else {
      Object.values(this.busForm.controls).forEach(control => {
        control.markAsTouched();
      });

      this.routeArray.controls.forEach(control => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(innerControl => {
            innerControl.markAsTouched();
          });
        }
      });
    }
  }



  deleteRoute(index: number) {
    if (this.routeArray.length > 1) {
      this.routeArray.removeAt(index);
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: 'An error occurred',
        showConfirmButton: false,
        timer: 2000
      });
    }
  }

  setInitialValues() {
    if (this.cloneBus) {
      this.isedit = true;
      this.busForm.patchValue({
        _id: this.cloneBus._id,
        busNumber: this.cloneBus.busNumber,
        departure: this.cloneBus.departure,
        departureTime: this.cloneBus.departureTime,
        destination: this.cloneBus.destination,
        TotalSeat: this.cloneBus.TotalSeat,
        charge: this.cloneBus.charge,
      });
      this.cloneBus.route.forEach((item: any) => {
        this.addRoute();
        this.routeArray.at(this.routeArray.length - 1).patchValue({
          previousStation: item.previousStation,
          currentStation: item.currentStation,
          distance: item.distance
        });
      })
      this.busForm.patchValue({
        route: this.cloneBus.route
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  selectRoute(route : Iroute){
    this.selectedRoute = route;
  }

  
  ondelete(route: Iroute) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed && route._id) {
        this.routeService.deleteRoute(route._id).subscribe({
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

  
  onRowEditInit(s: Istation) {
    this.clonedStation = { ...s };
    this.stationForm.patchValue({
      _id : this.clonedStation['_id'],
      station : this.clonedStation['station'],
    });
    this.isedit = true;
    this.isShowForm = true;
  }

  onDelete(s : Istation){
    this.loading = true;
    this.stationServivce.deletestation(s._id as string).subscribe({
      next: (res: IDeleteApiResponse) => {
        this.messageService.add({ severity:'success', summary: 'Success', detail: res.message});
        this.stations = this.stations.filter(i => i._id!== s._id);
      },
      error : (err )=> {
        this.loading = false;
      },
      complete : ()=>{
        this.loading = false;
      }
    });
  }




  onSubmit(){
    if (this.stationForm.valid) {
      this.loading = true;

      const submitObservable = this.isedit ?
      this.stationServivce.updatestation(this.stationForm.getRawValue()):
        this.stationServivce.createstation(this.stationForm.getRawValue());


      this.subscription.add(
        submitObservable.subscribe({
          next: (res : IstaionCreateApiresponse) => {
            delete this.clonedStation;
            this.messageService.add({ severity:'success', summary: 'Success', detail: res.message});
          },
         complete : ()=>{
          this.loading = false;
          this.isShowForm = false;
          this.isedit = false;
          console.log("fgfd");
          
         }
        })
      );
    } else {
      Object.values(this.stationForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }

}




