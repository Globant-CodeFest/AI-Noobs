import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export enum ChatbotSender {
  chatbot = 'chatbot',
  user = 'user',
}

export interface CardOptions {
  question?: string;
  dateAndTime?: Date;
}

@Component({
  selector: 'component-chatbot-card',
  styleUrls: ['./card.component.scss'],
  templateUrl: './card.component.html',
  animations: [
    trigger('openClose', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('500ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class ChatbotCardComponent {
  @Input() index = 0;
  @Input() content = '';
  @Input() sender!: ChatbotSender;
  @Input() options: CardOptions = {};
  @Output() refreshContent = new EventEmitter<any>();
}
