import { AbstractControl, ValidatorFn } from '@angular/forms';
export default class Validation {
  static match(controlName: string, checkControlName: string): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get(controlName);
      const checkControl = controls.get(checkControlName);
      if (checkControl?.errors && !checkControl.errors['matching']) {
        return null;
      }
      if (control?.value !== checkControl?.value) {
        controls.get(checkControlName)?.setErrors({ matching: true });
        return { matching: true };
      } else {
        return null;
      }
    };
  }
}

export class Util {
  static generateRandomString(characters: number) {
    return Math.random()
      .toString(36)
      .slice(2, characters + 2);
  }

  static removeSpace(str: string) {
    return str.replace(/\s\s+/g, ' ').trim();
  }

  static splitString(strArray: string, splitBy: string): string[] {
    const splitedArray: string[] = strArray.trim().split(`${splitBy}`);
    splitedArray.forEach((item, index) => {
      splitedArray[index] = this.removeSpace(item);
    });
    return splitedArray;
  }
}
