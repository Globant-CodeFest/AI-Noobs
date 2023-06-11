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
  cvsResponse: any = [];
  finalDataResponse: any = [];

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

  // submit() {
  //   if (this.subscription) {
  //     this.subscription.unsubscribe();
  //   }

  //   this.answer = '';
  //   const question = this.text;
  //   this.createReplyCard(ChatbotSender.user, question, {
  //     dateAndTime: new Date(),
  //   });
  //   this.subscription = this.ChatbotService.getServerSentEvent(
  //     this.text
  //   ).subscribe((message) => {
  //     console.log(message, 'respuesta');
  //     this.createReplyCard(
  //       ChatbotSender.chatbot,
  //       message?.choices[0]?.message?.content,
  //       {
  //         dateAndTime: new Date(),
  //       }
  //     );
  //   });
  //   this.text = '';
  // }

  submitLocal() {
    const version: any = this.text.match(/\d{4}/) || [];
    this.cvsResponse = [];
    const filesToSearch = version.length
      ? [version[0]?.substring(2)]
      : [22, 21, 20, 19, 18, 17, 16];
    filesToSearch.map((year) => {
      this.getData(year, false);
      this.getData(year, true);
    });
    setTimeout(() => {
      this.transformData(this.cvsResponse);
    }, 1000);
  }

  transformData(data: any) {
    this.finalDataResponse = data.map((item: any) => {
      return {
        name: item.long_name,
        age: item.age,
        weight: item.weight_kg,
        year: item.year,
      };
    });
    this.ChatbotService.getServerSentEvent(
      this.text,
      JSON.stringify(this.finalDataResponse)
    ).subscribe((message) => {
      this.createReplyCard(
        ChatbotSender.chatbot,
        message?.choices[0]?.message?.content,
        {
          dateAndTime: new Date(),
        }
      );
    });
    this.text = '';
  }

  clear() {
    this.text = '';
  }

  getData(year: any = 22, categoria: boolean) {
    this.ChatbotService.getInfo(year, categoria).subscribe((data) => {
      const finalData = this.formatCsvData(data).find((item: any) =>
        this.hasWordMatch(item?.long_name, this.text)
      );
      if (finalData) {
        finalData.year = year;
        this.cvsResponse.push(finalData);
        console.log(this.cvsResponse, 'finalData');
      }
    });
  }

  hasWordMatch(a: string, b: string) {
    if (a && b) {
      a = a.toLowerCase();
      b = b.toLowerCase();
      const a_parts = a.split(' ');
      const b_parts = b.split(' ');
      const a_length = a_parts.length;
      const b_length = b_parts.length;
      let i_a = 0;
      let i_b = 0;
      for (i_a = 0; i_a < a_length; i_a += 1) {
        for (i_b = 0; i_b < b_length; i_b += 1) {
          if (a_parts[i_a] === b_parts[i_b] && a_parts[i_a].length > 2) {
            return true;
          }
        }
      }
      return false;
    }
    return false;
  }

  formatCsvData(data: any) {
    const lines = data.replace(/"/g, '').replace(/'/g, '').split('\n');
    const headerValues = lines[0].split(',');
    const dataValues = lines
      .splice(1)
      .map((dataLine: any) => dataLine.split(','));
    return dataValues.map((rowValues: any) => {
      let row: any = {};
      headerValues.forEach((headerValue: any, index: number) => {
        row[headerValue] = rowValues[index];
      });
      return row;
    });
  }

  ngOnDestroy() {
    this.subscriptors.forEach((subscriptor) => subscriptor.unsubscribe());
  }
}
