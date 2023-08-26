import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { Notification, NotificationState } from 'src/app/types/notification';

@Component({
  selector: 'app-notification-card',
  templateUrl: './notification-card.component.html',
  styleUrls: ['./notification-card.component.scss'],
})
export class NotificationCardComponent implements OnInit {
  @Input() notification!: Notification;
  @Output() onNotificationClick: EventEmitter<void> = new EventEmitter();

  StateType = NotificationState;
  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {}

  handleClick() {
    this.notificationService.clickNotification(
      this.notification.userSend!,
      this.notification.post
    );

    this.onNotificationClick.emit();
  }
}
