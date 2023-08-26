import { DocumentReference } from '@angular/fire/compat/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  avatar: string;
  avatarId?: string;
  bio?: string;
  emailVerified: boolean;

  followers?: DocumentReference[];
  followings?: DocumentReference[];
}
