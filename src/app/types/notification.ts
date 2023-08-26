import { DocumentReference } from '@angular/fire/compat/firestore';
import { Post } from './post';
import { User } from './user';

export enum NotificationState {
  follow = 'follow',
  like = 'like',
  comment = 'comment',
}

export interface Notification {
  id: string;
  userSendRef: DocumentReference;
  userSend?: User;
  userReceiveRef: DocumentReference;
  userReceive?: User;
  postRef?: DocumentReference | null;
  post?: Post;
  state: NotificationState;
  isSeen: boolean;
  createdAt: number;
}
