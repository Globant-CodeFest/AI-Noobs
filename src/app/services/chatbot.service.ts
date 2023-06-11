import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { delayWhen } from 'rxjs/operators';

@Injectable()
export class ChatbotService {
  private BASE_URL = `https://api.openai.com/v1/chat/completions`;
  // private openIAKey = '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'; Alex's Key
  private openIAKey = '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'; // Alejo's Key

  constructor(private http: HttpClient) {}

  welcome() {
    const message = `Hi, User. I'm Chatbot Ai assistant.

    You can Ask me to Search, Fetch data, highlight stats from FIFA and much more.

    How can I help you?
    `;

    return of(message).pipe(delayWhen(() => timer(1000)));
  }

  getServerSentEvent(content: string, finalDataResponse: any): Observable<any> {
    const headers: HttpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.openIAKey}`,
      'Content-Type': 'application/json',
    });
    const data = {
      messages: [
        {
          role: 'user',
          content: `con base en esta informacion ${finalDataResponse} ${content}`,
        },
      ],
      model: 'gpt-3.5-turbo',
    };
    // return of('Test bot').pipe(delayWhen(() => timer(500)));
    return this.http.post<any>(`${this.BASE_URL}`, data, {
      headers,
    });
  }

  getInfo(version = 22, category = false) {
    const isFemale = category ? 'female_' : '';
    return this.http.get(
      `/assets/mock-data/${isFemale}players_${version}.csv`,
      {
        responseType: 'text',
      }
    );
  }
}
