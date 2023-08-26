import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isAuth!: boolean;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isAuth.subscribe((status: boolean) => {
      this.isAuth = status;
    });
  }

  title = 'social-app';
}
