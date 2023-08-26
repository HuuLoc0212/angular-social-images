import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Notification, NotificationState } from '../types/notification';
import { Post } from '../types/post';
import { User } from '../types/user';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { PostService } from './post.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private router: Router
  ) {}

  getNotifications() {
    return this.afs
      .collection('users')
      .doc(this.authService.currentUser?.uid)
      .collection('notifications', (ref) => ref.orderBy('createdAt', 'asc'))
      .stateChanges(['added', 'modified']);
  }

  createNotification(
    userSendId: string,
    userReceiveId: string,
    postId?: string,
    state?: NotificationState
  ) {
    const notificationId = this.afs.createId();

    const userSendRef = this.firestoreService.generateUserRef(userSendId);
    const userReceiveRef = this.firestoreService.generateUserRef(userReceiveId);

    const postRef = postId
      ? this.firestoreService.generatePostRef(postId)
      : null;

    const notification: Notification = {
      id: notificationId,
      userSendRef: userSendRef,
      userReceiveRef: userReceiveRef,
      postRef: postRef,
      state: state!,
      createdAt: Date.now(),
      isSeen: false,
    };

    userReceiveRef
      .collection('notifications')
      .doc(notificationId)
      .set(notification); // Notification Type
  }

  async populateNotification(
    notification: Notification
  ): Promise<Notification> {
    let populatedNotification = notification;
    // Populate user send info
    const userSendInfo: User = await this.firestoreService.getUserInfoByRef(
      notification.userSendRef
    );
    populatedNotification.userSend = userSendInfo;

    // Populate user receive info
    const userReceiveInfo: User = await this.firestoreService.getUserInfoByRef(
      notification.userReceiveRef
    );
    populatedNotification.userReceive = userReceiveInfo;

    // Populate post info
    if (notification.postRef) {
      const postInfor = await this.firestoreService.getPostByPostRef(
        notification.postRef!
      );
      populatedNotification.post = postInfor;
    }

    return populatedNotification;
  }

  seenNotification(notificationId: string) {
    this.afs
      .collection('users')
      .doc(this.authService.currentUser?.uid)
      .collection('notifications')
      .doc(notificationId)
      .update({ isSeen: true });
  }

  clickNotification(user: User, post?: Post) {
    if (post) {
      // interact with post
      this.router.navigateByUrl(`post/${post.id}`);
    } else {
      // interact with user
      this.router.navigateByUrl(`profile/${user.username}`);
    }
  }
}
