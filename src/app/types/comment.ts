import { DocumentReference } from '@angular/fire/compat/firestore';
import { Reply } from './reply';
import { User } from './user';

export interface CommentType {
  id: string;
  content: string;
  createdAt: number;
  likes: DocumentReference[];
  userRef: DocumentReference;
  postRef: DocumentReference;

  author?: User;
  replies: Reply[];
}
