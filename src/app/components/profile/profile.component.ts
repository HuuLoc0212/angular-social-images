import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { FollowService } from 'src/app/services/follow.service';
import { User } from 'src/app/types/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  username!: string;
  isOpenFollowers: boolean = false;
  userSubscription = new Subject<void>();

  user?: User;
  isMe: boolean = false;
  isFollow: boolean = false;
  isLoading: boolean = true;

  userUnsubcribe = new Subject<void>(); // temporary

  // is exist
  isExist: boolean = true;

  constructor(
    private authService: AuthService,
    private followService: FollowService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // When router changes => Unsubscribe
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => {
        this.userUnsubcribe.next();
        this.userSubscription.next();
      });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.username = params['username'];

      this.authService.checkUser(this.username).subscribe((user) => {
        // if your exist
        if (user.docs && user.docs.length > 0) {
          this.authService
            .getUserByUsername(this.username)
            .pipe(takeUntil(this.userSubscription))
            .subscribe(async (users: any[]) => {
              if (users.length > 0) {
                this.user = users[0];

                this.authService.userObserver
                  .pipe(takeUntil(this.userUnsubcribe))
                  .subscribe((userResult: User) => {
                    if (userResult) {
                      this.isMe =
                        this.user?.uid == userResult.uid ? true : false;

                      // Check follow
                      if (!this.isMe) {
                        this.isFollow = this.followService.checkFollow(
                          this.user!
                        );
                      }

                      this.isLoading = false;
                    }
                  });
              }
            });
        } else {
          // username not exist
          this.isExist = false;
        }
      });
    });
  }

  handleFollow() {
    this.followService.followUser(this.authService.currentUser!, this.user!); // user send follow, user receive follow
  }

  // ngOnDestroy() {
  //   this.userUnsubcribe.next();
  //   this.userSubscription.unsubscribe();
  // }

  toggleOpenFollowers() {
    this.isOpenFollowers = !this.isOpenFollowers;
  }

  faPlus = faPlus;
}
