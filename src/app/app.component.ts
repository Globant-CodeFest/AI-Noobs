import {
  Component,
  ComponentRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

import { Subscription } from 'rxjs';

import {
  CardOptions,
  ChatbotCardComponent,
  ChatbotSender,
} from './components/card.component';
import { ChatbotService } from './services/chatbot.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  text = '';
  screenHeight = window.innerHeight;
  scrollHeight = 390;

  subscriptors: Subscription[] = [];
  chatbotCards: ComponentRef<ChatbotCardComponent>[] = [];
  chatbotCardsCreated!: ComponentRef<ChatbotCardComponent>;
  subscription!: Subscription;

  @ViewChild('conversationList') conversationList: any;

  @ViewChild('conversationCardPlaceholder', { read: ViewContainerRef })
  conversationCardPlaceholder!: ViewContainerRef;
  answer!: string;

  constructor(private ChatbotService: ChatbotService) {}

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?: any) {
    this.screenHeight = window.innerHeight;
  }

  ngOnInit() {
    this.subscriptors.push(
      this.ChatbotService.welcome().subscribe((message) => {
        this.createReplyCard(ChatbotSender.chatbot, message, {
          dateAndTime: new Date(),
        });
      })
    );
  }

  createReplyCard(sender: any, value: any, options: CardOptions = {}) {
    const cardComponent =
      this.conversationCardPlaceholder.createComponent(ChatbotCardComponent);
    cardComponent.instance.content = value;
    cardComponent.instance.sender = sender;
    cardComponent.instance.options = options;
    this.chatbotCardsCreated = cardComponent;
    if (sender === ChatbotSender.chatbot) {
      cardComponent.instance.index = this.chatbotCards.length;
      this.chatbotCards.push(cardComponent);
    }
    setTimeout(() => {
      this.conversationList.nativeElement.scroll(
        0,
        this.conversationList.nativeElement.clientHeight
      );
    }, 100);
  }

  submit() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.answer = '';
    const question = this.text;
    this.createReplyCard(ChatbotSender.user, question, {
      dateAndTime: new Date(),
    });
    this.subscription = this.ChatbotService.getServerSentEvent(
      this.text
    ).subscribe((message) => {
      console.log(message, 'respuesta');
      this.createReplyCard(ChatbotSender.chatbot, message);
    });
    this.text = '';
  }

  clear() {
    this.text = '';
  }

  ngOnDestroy() {
    this.subscriptors.forEach((subscriptor) => subscriptor.unsubscribe());
  }
}
