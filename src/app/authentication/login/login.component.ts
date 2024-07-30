import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginform !: FormGroup;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loginform = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

  }
  onsubmit(): void {
    if (this.loginform.valid) {
      this.loading = true;
      this.authService.login(this.loginform.value).subscribe({
        next: (resdata: any) => {
          if (resdata.data) {
            this.loading = false;
            localStorage.clear();
            localStorage.setItem('token', resdata.data.token);
            localStorage.setItem('user', JSON.stringify(resdata.data.user));
            this.loginform.reset();
            this.router.navigate(['/'])
          }
          else {
            this.loading = false;
            this.loginform.reset();
          }
        },
        error: (res) => {
          this.loading = false;
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: res.error.message,
          })
        }
      })
    }
    else {
      Object.values(this.loginform.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }
}
