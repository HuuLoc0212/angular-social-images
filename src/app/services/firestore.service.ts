import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Post } from '../types/post';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private afs: AngularFirestore) {}

  generateUserRef = (userId: string): DocumentReference<any> => {
    return this.afs.collection('users').doc(userId).ref;
  };

  generatePostRef = (postId: string): DocumentReference<any> => {
    return this.afs.collection('posts').doc(postId).ref;
  };

  async getUserInfoByRef(userRef: DocumentReference) {
    const res = await userRef.get();
    return res.data() as User;
  }

  async getPostByPostRef(postRef: DocumentReference): Promise<Post> {
    const res = await postRef.get();
    return res.data() as Post;
  }
}
