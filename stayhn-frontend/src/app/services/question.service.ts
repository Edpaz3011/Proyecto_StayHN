import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question, QuestionRequest } from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:5042/api/question';

  constructor(private http: HttpClient) { }

  createQuestion(question: QuestionRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, question);
  }

  getQuestionsByAccommodation(accommodationId: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/accommodation/${accommodationId}`);
  }

  getAllQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(this.apiUrl);
  }






  
  answerQuestion(id: string, answerText: string, answeredBy: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/answer`, { answerText, answeredBy });
  }

  approveQuestion(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {});
  }
}






