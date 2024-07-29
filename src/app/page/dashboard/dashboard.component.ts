import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Ibus } from 'src/app/core/interfaces/ibus';

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
  
  buses: Ibus[] = [];
  cloneBus: Ibus | undefined;
  minDate!: string;
  loading: boolean = false;
  selectedBus!: Ibus;
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.role = JSON.parse(localStorage.getItem('user') as string)?.role || "";

  }

  ngOnInit(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    }

  displayedColumns: string[] = ['Station', 'Arrival Time', 'Distance'];
  dataSource !: any[];

  addbus() {
    this.router.navigate(['/add-bus']);
  }
}