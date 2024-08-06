import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {  SelectItem } from 'primeng/api';
import { IstaionGetApiresponse } from 'src/app/core/interfaces/istaion-get-apiresponse';
import { Istation } from 'src/app/core/interfaces/istation';
import { StationService } from 'src/app/core/services/station.service';
import { MessageService } from 'primeng/api';
import { IstaionCreateApiresponse } from 'src/app/core/interfaces/istaion-create-apiresponse';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { IDeleteApiResponse } from 'src/app/core/interfaces/idelete-api-response';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.scss']
})
export class StationsComponent implements OnInit {
  stations !: Istation[];
  loading =false;
  role !: string
  statuses!: SelectItem[];
  stationForm!: FormGroup;
  isedit = false;
  isShowForm = false;
  clonedStation:  Istation | undefined;
  private subscription: Subscription = new Subscription();

  constructor(
    private stationServivce: StationService,
    private messageService: MessageService,
    private fb : FormBuilder,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.role = JSON.parse(localStorage.getItem('user') as string).role;
    this.stationForm = this.fb.group({
      _id: [""],
      station: ['', Validators.required],
    });

  }

  ngOnInit(): void {
    this.loading = true;
    this.stationServivce.getAll().subscribe({
      next: (res: IstaionGetApiresponse) => {
        this.stations = res.data as Istation[];
      },
      complete : ()=>{
        this.loading = false;
      }
    })


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

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
            
            if (!this.stations.includes(this.clonedStation as Istation)) {              
              this.stations.push(res.data);
            }
            delete this.clonedStation;
            this.ngOnInit()
            Swal.fire({
              toast : true,
              position: 'top-end',
              title: 'Success!',
              text: res.message,
              icon:'success',
              timer: 3000,
              showConfirmButton : false
            })
          },
         complete : ()=>{
          this.loading = false;
          this.isShowForm = false;
          this.isedit = false;
         }
        })
      );
    } else {
      Object.values(this.stationForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }
}
