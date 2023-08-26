import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import { NotificationState } from '../types/notification';
import { User } from '../types/user';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class FollowService {
  constructor(
    private afs: AngularFirestore,
    private firestoreService: FirestoreService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  async getFollowers(uid: string): Promise<User[]> {
    const followers: User[] = [];

    const user: User = (
      await this.afs.collection('users').doc(uid).ref.get()
    ).data() as User;

    user.followers?.forEach(async (followerRef) => {
      const res = await followerRef.get();
      const follower: User = res.data() as User;
      followers.push(follower);
    });

    return followers;
  }

  // userSend, userReceive
  followUser(userSend: User, userReceive: User) {
    const userReceiveFollowers: DocumentReference<any>[] =
      userReceive.followers ?? [];
    const userSendFollowings: DocumentReference<any>[] =
      userSend.followings ?? [];

    // create user send reference
    const userSendRef: DocumentReference<any> =
      this.firestoreService.generateUserRef(userSend.uid);
    // create user receive reference
    const userReceiveRef: DocumentReference<any> =
      this.firestoreService.generateUserRef(userReceive.uid);

    // Check if user is already follow this user
    if (userReceiveFollowers.some((user) => user.path == userSendRef.path)) {
      // remove user send from user receive list followers
      let index = this.findIndex(userReceiveFollowers, userSendRef);
      userReceiveFollowers.splice(index, 1);

      // remove user receive from user send list follings
      index = this.findIndex(userSendFollowings, userReceiveRef);
      userSendFollowings.splice(index, 1);
    } else {
      // if not
      userReceiveFollowers.push(userSendRef);
      userSendFollowings.push(userReceiveRef);

      // Notification
      this.notificationService.createNotification(
        userSend.uid,
        userReceive.uid,
        '',
        NotificationState.follow
      );
    }

    // update db
    this.afs.collection('users').doc(userReceive.uid).update({
      followers: userReceiveFollowers,
    });
    this.afs.collection('users').doc(userSend.uid).update({
      followings: userSendFollowings,
    });
  }

  // check if you follow this user
  checkFollow(user: User) {
    let result = false;

    if (user.followers) {
      result = user.followers.some(
        (follower) => follower.id == this.authService.currentUser?.uid
      );
    }

    return result;
  }

  checkFollowSelf(followerId: string) {
    let result = false;

    if (this.authService.currentUser?.uid == followerId) result = true;

    return result;
  }

  findIndex(list: DocumentReference[], itemRef: DocumentReference) {
    return list.map((item) => item.path).indexOf(itemRef.path);
  }
}
