import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentData,
  DocumentReference,
} from '@angular/fire/compat/firestore';

import { Router } from '@angular/router';
import { BehaviorSubject, first, map, Observable, switchMap, take } from 'rxjs';

import { Post } from '../types/post';
import { User } from '../types/user';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { NotificationState } from '../types/notification';
import { FirestoreService } from './firestore.service';
import { UtilService } from './util.service';
import { ToastrService } from 'ngx-toastr';
import { Util } from 'src/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private postsCollection: AngularFirestoreCollection<any>;

  constructor(
    private afs: AngularFirestore,
    private utilService: UtilService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private firestoreService: FirestoreService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.postsCollection = this.afs.collection('posts');
  }

  get posts() {
    return this.postsCollection.stateChanges(['added']);
  }

  checkPost(id: string) {
    return this.afs.collection('posts').doc(id).get();
  }

  getPost(id: string) {
    return this.afs.collection('posts').doc<Post>(id).snapshotChanges();
  }

  // getPostsNewMethod(): Observable<Post[]> {
  //   return this.afs
  //     .collection('posts')
  //     .snapshotChanges()
  //     .pipe(
  //       switchMap(async (actions) => {
  //         const promises = actions.map(async (item) => {
  //           const post = item.payload.doc.data() as Post;
  //           const populatedPost = await this.populatePost(post);
  //           return { ...populatedPost };
  //         });

  //         return await Promise.all(promises);
  //       })
  //     );
  // }

  getPostOnce(postId: string) {
    return this.afs
      .collection('posts')
      .doc(postId)
      .get()
      .pipe(
        map((result) => {
          return result.data();
        })
      );

    // return postRef
  }

  getPostsByKeyword(keyword: string) {
    return this.afs
      .collection('posts', (ref) =>
        ref.where('keywords', 'array-contains', keyword)
      )
      .stateChanges();
  }

  getPostsByKeywords(keywords: String[]) {
    return this.afs
      .collection('posts', (ref) =>
        ref.where('keywords', 'array-contains-any', keywords)
      )
      .stateChanges();
  }

  async getUserPosts(username: string) {
    return this.authService
      .getUserByUsername(username)
      .pipe(take(1))
      .pipe(
        map((result) => {
          const user: User = result[0] as User;
          const userRef = this.firestoreService.generateUserRef(user.uid);

          return this.afs
            .collection('posts', (ref) => ref.where('userRef', '==', userRef))
            .stateChanges();
          // .pipe(take(1));
        })
      );
  }

  getUserLikedPosts(username: string) {
    return this.authService
      .getUserByUsername(username)
      .pipe(take(1))
      .pipe(
        map((result) => {
          const user: User = result[0] as User;
          const userRef = this.firestoreService.generateUserRef(user.uid);

          return this.afs
            .collection('posts', (ref) =>
              ref.where('likes', 'array-contains', userRef)
            )
            .stateChanges();
        })
      );
  }

  async populatePost(post: Post): Promise<Post> {
    const response: any = await post.userRef.get();
    const user = response.data();

    const populatedPost: Post = {
      ...post,
      author: user as User,
    };

    return populatedPost;
  }

  getPostComments(id: string) {
    return this.afs
      .doc<Post>(`posts/${id}`)
      .collection('comments', (ref) => ref.orderBy('createdAt', 'desc'))
      .stateChanges(['added']);
  }

  createPost(postData: any) {
    this.isLoading.next(true);

    this.utilService
      .createImageUrl(postData.image)
      .subscribe(async (result: any) => {
        // create user reference
        const userRef: DocumentReference<any> = this.afs
          .collection('users')
          .doc(this.authService.currentUser?.uid).ref;

        const newPost: Post = {
          id: this.afs.createId(),
          imageId: result.public_id,
          imageUrl: result.secure_url,
          createdAt: Date.now(),
          keywords: Util.splitString(postData.keywords, ','),
          title: postData.title,
          description: postData.description ?? '',
          userRef: userRef,
        };

        await this.postsCollection.doc(newPost.id).set(newPost);
        this.isLoading.next(false);

        this.toastr.success('Create new post successfully!');

        this.router.navigateByUrl(`post/${newPost.id}`);
      });
  }

  async deletePost(post: Post) {
    await this.postsCollection.doc(post.id).delete();
    this.utilService.deleteImageSource(post.imageId);
  }

  async editPost(postId: string, editData: any) {
    try {
      this.isLoading.next(true);
      editData.keywords = Util.splitString(editData.keywords, ',');
      await this.postsCollection.doc(postId).update(editData);

      this.toastr.success('Update post successfully!');
    } catch (err: any) {
      this.toastr.error(err.message);
    } finally {
      this.isLoading.next(false);
    }
  }

  downloadImage(imageUrl: string, imageName: string): void {
    this.utilService.downloadImage(imageUrl, imageName);
  }

  copyImageUrl(post: Post) {
    navigator.clipboard
      .writeText(post.imageUrl)
      .then(() => this.toastr.success('Copied image URL to clipboard!'))
      .catch((e) => console.error(e));
  }

  // REACTIONS

  //post and id user like
  likePost(post: Post, uid: string) {
    const postLikes: DocumentReference<any>[] = post.likes ?? [];

    // create user reference
    const userRef: DocumentReference<any> =
      this.firestoreService.generateUserRef(uid);

    // Check if user is already liked this post
    if (postLikes.some((user) => user.path == userRef.path)) {
      const index = postLikes.map((item) => item.path).indexOf(userRef.path);
      postLikes.splice(index, 1);
    } else {
      // if not
      postLikes.push(userRef);

      // Not notification if you interact with your post
      if (uid != post.author?.uid) {
        // Notification
        this.notificationService.createNotification(
          uid,
          post.author?.uid!,
          post.id,
          NotificationState.like
        );
      }
    }

    this.postsCollection.doc(post.id).update({
      likes: postLikes,
    });
  }

  // private _deleteImageSource(imageId: string): void {
  //   let httpHeaders = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //   });
  //   this.http.post(
  //     'https://imagesio.herokuapp.com/api/image/deleteImage',
  //     {
  //       cloudinary_id: imageId,
  //     },
  //     { headers: httpHeaders }
  //   );
  // }
}
