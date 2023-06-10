import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { delayWhen } from 'rxjs/operators';

@Injectable()
export class ChatbotService {
  private BASE_URL = `https://api.openai.com/v1/chat/completions`;
  private openIA = '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';
  constructor(private http: HttpClient) {}

  welcome() {
    const message = `Hi, User. I'm Chatbot Ai assistant.

    You can Ask me to Search, Fetch data, highlight stats from FIFA and much more.

    How can I help you?
    `;

    return of(message).pipe(delayWhen(() => timer(1000)));
  }

  getServerSentEvent(content: string): Observable<any> {
    const message = `Respuesta Bot`;
    const headers: HttpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.openIA}`,
      'Content-Type': 'application/json',
    });
    const data = {
      messages: [{ role: 'user', content }],
      model: 'gpt-3.5-turbo',
    };
    // return of(message).pipe(delayWhen(() => timer(500)));
    return this.http.post<any>(`${this.BASE_URL}`, data, {
      headers,
    });
  }
}
