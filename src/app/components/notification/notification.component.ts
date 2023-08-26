import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Notification } from 'src/app/types/notification';
import { User } from 'src/app/types/user';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  @Output() onNotificationClick: EventEmitter<void> = new EventEmitter();
  notificationsSubscription!: Subscription;

  notifications: Notification[] = [];

  isLoading: boolean = true;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationsSubscription = this.notificationService
      .getNotifications()
      .subscribe(async (val) => {
        for (let i = 0; i < val.length; i++) {
          await this.asynchronousProcess(val[i]);
          // Done loading
          if (i + 1 == val.length) {
            this.isLoading = false;
          }
        }
      });
  }

  ngOnDestroy() {
    this.notificationsSubscription.unsubscribe();
  }

  asynchronousProcess = async (item: any) => {
    if (item.type == 'added') {
      let notification: Notification = item.payload.doc.data() as Notification;

      notification = await this.notificationService.populateNotification(
        notification
      );

      this.notifications.unshift(notification);
      // console.log(this.notifications);
      // Set this notification is seen, so it will not show in notification badge
      if (!notification.isSeen) {
        this.notificationService.seenNotification(notification.id);
      }
    }
  };

  notificationClick() {
    this.onNotificationClick.emit();
  }
}
