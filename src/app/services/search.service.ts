import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(
    private afs: AngularFirestore,
    private authService: AuthService
  ) {}

  getKeywords() {
    return this.afs.collection('keywords').get();
  }

  getRecentSearchKeywords() {
    return this.afs
      .collection('search', (ref) =>
        ref.where('userId', '==', this.authService.currentUser!.uid)
      )
      .stateChanges();
  }

  addRecentSearchKeyword(keyword: string, userId: string) {
    const snapshot = this.afs
      .collection('search', (ref) => ref.where('userId', '==', userId))
      .get();

    snapshot.subscribe((result) => {
      if (result.docs.length > 0) {
        const searchDoc: any = result.docs[0].data();
        const recentSearch: string[] = searchDoc.keywords;

        // Check if keyword is exist in array
        if (
          recentSearch.length > 0 &&
          recentSearch.some((word) => word == keyword)
        ) {
          const index = recentSearch.findIndex((word) => word == keyword);
          recentSearch.splice(index, 1);
        }

        // add keyword to the first index of the array
        recentSearch.unshift(keyword);

        // update document
        result.docs[0].ref.update({
          keywords: recentSearch,
        });
      } else {
        // search doc user not exist => create one
        const docId = this.afs.createId();
        this.afs
          .collection('search')
          .doc(docId)
          .set({
            id: docId,
            userId: userId,
            keywords: [keyword],
          });
      }
    });
  }
}
