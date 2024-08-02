import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Iuser } from 'src/app/core/interfaces/iuser';
import { SharedService } from 'src/app/core/services/shared.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private sharedService: SharedService,
  ) {

  }
  searchForm !: FormGroup

  user !: Iuser
role !: string;


  ngOnInit(): void {
    const user: Iuser = JSON.parse(localStorage.getItem('user') as string);
    this.user = user;
    this.role = user.role;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['auth']);
  }
}
