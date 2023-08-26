import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, scan, take, tap } from 'rxjs';
import { PostService } from './post.service';

// Options to reproduce firestore queries consistently
interface QueryConfig {
  path: string; // path to collection
  field: string; // field to orderBy
  limit?: number; // limit per query
  reverse?: boolean; // reverse order?
  prepend?: boolean; // prepend to source?
}

@Injectable({
  providedIn: 'root',
})
export class PaginationService {
  // Source data
  private _done: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private _data: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  private query!: QueryConfig;

  // Observable data
  data!: Observable<any>;
  done: Observable<boolean> = this._done.asObservable();
  loading: Observable<boolean> = this._loading.asObservable();

  constructor(
    private afs: AngularFirestore,
    private postService: PostService
  ) {}

  // Initial query sets options and defines the Observable
  init(path: string, field: string, opts?: any) {
    this.query = {
      path,
      field,
      limit: 14,
      reverse: false,
      prepend: false,
      ...opts,
    };

    const first = this.afs.collection(this.query.path, (ref) => {
      return ref
        .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
        .limit(this.query.limit as number);
    });

    this.mapAndUpdate(first);

    // Create the observable array for consumption in components
    this.data = this._data.asObservable().pipe(
      scan((acc, val) => {
        return this.query.prepend ? val.concat(acc) : acc.concat(val);
      })
    );
  }

  // Retrieves additional data from firestore
  more() {
    const cursor = this.getCursor();

    const more = this.afs.collection(this.query.path, (ref) => {
      return ref
        .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
        .limit(this.query.limit as number)
        .startAfter(cursor);
    });

    this.mapAndUpdate(more);
  }

  // Determines the doc snapshot to paginate query
  private getCursor() {
    const current = this._data.value;
    if (current.length) {
      return this.query.prepend
        ? current[0].doc
        : current[current.length - 1].doc;
    }
    return null;
  }

  // Maps the snapshot to usable format the updates source
  private mapAndUpdate(col: AngularFirestoreCollection<any>) {
    if (this._done.value || this._loading.value) {
      return;
    }

    // loading
    this._loading.next(true);

    // Map snapshot with doc ref (needed for cursor)
    return col
      .snapshotChanges()
      .pipe(
        tap(async (arr) => {
          let values = arr.map((snap) => {
            const data = snap.payload.doc.data();
            const doc = snap.payload.doc;
            return { ...data, doc };
          });

          // If prepending, reverse array
          values = this.query.prepend ? values.reverse() : values;

          // Populate post
          values = await Promise.all(
            values.map(async (value) => {
              const populatedPost = await this.postService.populatePost(value);
              return { ...populatedPost };
            })
          );

          // update source with new values, done loading
          this._data.next(values);
          this._loading.next(false);

          // no more values, mark done
          if (!values.length) {
            this._done.next(true);
          }
        })
      )
      .pipe(take(1))
      .subscribe();
  }

  // Reset the page
  reset() {
    this._data.next([]);
    this._done.next(false);
  }
}
