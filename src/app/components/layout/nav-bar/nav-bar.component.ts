import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { faBars, faBell } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Notification } from 'src/app/types/notification';
import { Util } from 'src/utils/utils';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  @ViewChild('search') searchElement!: ElementRef;
  isOpenSidebar: boolean = false;
  isOpenNotification: boolean = false;
  notificationClick: boolean = false;

  isOpenSearch: boolean = false;
  searchClick: boolean = false;
  searchQuery!: string;

  notificationBadge: number = 0;

  currentUser: any;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private renderer: Renderer2
  ) {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (!this.notificationClick) {
        this.isOpenNotification = false;
      }
      this.notificationClick = false;

      if (!this.searchClick) {
        this.isOpenSearch = false;
      } else {
        this.isOpenSearch = true;
        this.searchClick = false;
      }
    });

    this.authService.isAuth.subscribe((status) => {
      if (status == true) {
        this.currentUser = this.authService.currentUser;
      }
    });
  }

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe((val) => {
      val.forEach((item) => {
        const notification: Notification =
          item.payload.doc.data() as Notification;
        if (!notification.isSeen) {
          this.notificationBadge++;
        }
      });
    });
  }

  toggleSidebar() {
    this.isOpenSidebar = !this.isOpenSidebar;
  }

  signOut() {
    this.authService.signOut();
  }

  // Notification
  toggleNotification() {
    this.isOpenNotification = !this.isOpenNotification;

    if (this.isOpenNotification) {
      this.notificationBadge = 0;
    }
  }
  preventCloseOnClick() {
    this.notificationClick = true;
  }

  // Search
  toggleSearch() {
    this.isOpenSearch = !this.isOpenSearch;
  }
  preventCloseSearchClick() {
    this.searchClick = true;
  }

  handleSearch() {
    this.searchQuery = Util.removeSpace(this.searchQuery); // Remove unnecessary space
    this.router.navigateByUrl(`/search?kq=${this.searchQuery}`);
    this.isOpenSearch = false;
    // unfocus input
    this.searchElement.nativeElement.blur();
  }

  navigateHome() {
    this.searchQuery = '';
    this.router.navigateByUrl('/');
  }

  faBars = faBars;
  faBell = faBell;
}
