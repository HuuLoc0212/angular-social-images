import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import fileDownload from 'js-file-download';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  isFooterVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  constructor(private http: HttpClient) {}

  isFileImage(file: any) {
    return file && file['type'].split('/')[0] === 'image';
  }

  createImageUrl(image: File) {
    let formData = new FormData();
    formData.append('image', image);

    return this.http.post(
      'https://imagesio.herokuapp.com/api/image/getUrl',
      formData
    );
  }

  downloadImage(imageUrl: string, imageName: string): void {
    this.http
      .get(imageUrl, {
        responseType: 'blob',
      })
      .subscribe((res) => {
        fileDownload(res, `${imageName ?? 'image'} .jpg`);
      });
  }

  deleteImageSource(imageId: string): void {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    this.http.post(
      'https://imagesio.herokuapp.com/api/image/deleteImage',
      {
        cloudinary_id: imageId,
      },
      { headers: httpHeaders }
    );
  }

  toggleVisibleFootter() {
    this.isFooterVisible.next(!this.isFooterVisible.value);
  }
}
