import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import { User } from '../types/user';
import { CommentType } from '../types/comment';
import { Post } from '../types/post';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { NotificationState } from '../types/notification';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  constructor(
    private afs: AngularFirestore,
    private firestoreService: FirestoreService,
    private notificationService: NotificationService
  ) {}

  async getCommentAuthor(userRef: DocumentReference) {
    const res = await userRef.get();
    return res.data() as User;
  }

  async writeComment(content: string, postId: string, userSendId: string) {
    // console.log(content, postId, userId);

    const commentId: string = this.afs.createId();

    const comment: CommentType = {
      id: commentId,
      content: content,
      postRef: this.afs.collection('posts').doc<Post>(postId).ref,
      userRef: this.afs.collection('users').doc<User>(userSendId).ref,
      createdAt: Date.now(),
      likes: [],
      replies: [],
    };

    // add comment to post
    this.afs
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .doc(commentId)
      .set(comment);

    const post: Post = await this.firestoreService.getPostByPostRef(
      comment.postRef
    );

    const postAuthor: User = await this.firestoreService.getUserInfoByRef(
      post.userRef
    );

    if (userSendId != postAuthor.uid) {
      // Notification
      this.notificationService.createNotification(
        userSendId, // user send id
        postAuthor.uid, // user receive id
        postId,
        NotificationState.comment
      );
    }
  }
}
