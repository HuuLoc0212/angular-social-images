import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-feedback',
  templateUrl: './error-feedback.component.html',
  styleUrls: ['./error-feedback.component.scss'],
})
export class ErrorFeedbackComponent implements OnInit {
  @Input() message!: string;
  constructor() {}

  ngOnInit(): void {}
}
