import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subject, take, takeUntil } from 'rxjs';
import { User } from '../types/user';
import { UtilService } from './util.service';
import { Util } from 'src/utils/utils';

import firebase from 'firebase/compat';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isAuth: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _currentUser?: User | null;

  public userObserver: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private userUnsubcribe = new Subject<void>();

  constructor(
    public afAuth: AngularFireAuth,
    public afFirestore: AngularFirestore,
    private utilService: UtilService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.afAuth.onAuthStateChanged(async (user) => {
      if (user) {
        this.getUserById(user.uid)
          .pipe(takeUntil(this.userUnsubcribe))
          .subscribe((userInfo: any) => {
            this.setUser(userInfo);
            this._setAuth(true);
          });
      } else {
        this.userUnsubcribe.next();
        this.setUser(null);
        this._setAuth(false);
      }
    });
  }

  setUser(userInfo: User | null) {
    this._currentUser = userInfo;
    this.userObserver.next(userInfo!);
  }

  get currentUser() {
    return this._currentUser;
  }

  getUserById(uid: string) {
    return this.afFirestore.collection('users').doc(uid).valueChanges();
  }

  checkUser(username: String) {
    return this.afFirestore
      .collection('users', (ref) => ref.where('username', '==', username))
      .get();
  }

  getUserByUsername(username: string) {
    return this.afFirestore
      .collection('users', (ref) => ref.where('username', '==', username))
      .valueChanges();
  }

  signUp(signUpData: any) {
    this.afAuth
      .createUserWithEmailAndPassword(signUpData.email, signUpData.password)
      .then((response) => {
        this._addUser(response.user);
        this.router.navigateByUrl('/');
      })
      .catch((err) => {
        switch (err.code) {
          case 'auth/email-already-in-use':
            this.toastr.error(
              'This email is already used by another user. Please choose another.'
            );
            break;
          default:
            this.toastr.error(err.message);
        }
      });
  }

  signIn(email: string, password: string) {
    this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.router.navigateByUrl('/');
        this.toastr.success(`Welcome ${result.user?.email}`);
      })
      .catch((err) => {
        switch (err.code) {
          case 'auth/wrong-password':
            this.toastr.error('The password you entered is incorrect.');
            break;
          case 'auth/invalid-email':
            this.toastr.error('Please enter a valid email.');
            break;
          default:
            this.toastr.error(err.message);
        }
      });
  }

  // Sign in with Google
  async GoogleAuth() {
    await this.AuthLogin(new GoogleAuthProvider());
    this.router.navigateByUrl('/');
  }

  // Sign in with Facebook
  async FacebookAuth() {
    await this.AuthLogin(new FacebookAuthProvider());
    this.router.navigateByUrl('/');
  }

  // Auth logic to run auth providers
  async AuthLogin(provider: any) {
    try {
      const result = await this.afAuth.signInWithPopup(provider);

      if (result) {
        // Check if email is not exist then add the user
        this.afFirestore
          .collection(`users`, (ref) =>
            ref.where('email', '==', result.user!.email)
          )
          .snapshotChanges()
          .pipe(take(1))
          .subscribe((res) => {
            if (res.length < 1) {
              this._addUser(result.user);
            }
          });
      }
    } catch (err: any) {
      this.toastr.error(err.message);
    }
  }

  signOut() {
    this.afAuth.signOut().then(() => this.router.navigateByUrl('/sign-in'));
  }

  private _setAuth(value: boolean) {
    this.isAuth.next(value);
  }

  private _addUser(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afFirestore.doc(
      `users/${user.uid}`
    );

    const randomUsername = Util.generateRandomString(8); // 8 characters

    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      username: randomUsername,
      avatar:
        user.photoURL ??
        'https://res.cloudinary.com/ndth4ng/image/upload/v1655196190/SocialImages/blank-profile-picture-973460_h0cr2l.png',
      emailVerified: user.emailVerified,
    };

    userRef.set(userData, {
      merge: true,
    });
  }

  async updateUser(editUserData: EditUserData) {
    if (editUserData.image) {
      this.utilService
        .createImageUrl(editUserData.image)
        .subscribe(async (result: any) => {
          await this.afFirestore
            .collection('users')
            .doc<User>(this.currentUser?.uid)
            .update({
              avatar: result.secure_url,
              avatarId: result.public_id,
              bio: editUserData.bio,
              displayName: editUserData.displayName,
              username: editUserData.username,
            });

          this.toastr.success(`Update profile successfully.`);
        });
    } else {
      await this.afFirestore
        .collection('users')
        .doc<User>(this.currentUser?.uid)
        .update({
          bio: editUserData.bio,
          displayName: editUserData.displayName,
          username: editUserData.username,
        });
      this.toastr.success(`Update profile successfully.`);
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      await this.afAuth.signInWithEmailAndPassword(
        this.currentUser!.email,
        currentPassword
      );

      const user = await this.afAuth.currentUser;
      await user?.updatePassword(newPassword);

      this.toastr.success('Update password successfully!');
    } catch (err: any) {
      switch (err.code) {
        case 'auth/wrong-password':
          this.toastr.error('Your current password does not correct!');
          break;
        default:
          this.toastr.error(err.message);
          break;
      }
    }
  }
}

interface EditUserData {
  image?: File;
  displayName?: string;
  bio?: string;
  username: string;
}
