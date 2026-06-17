import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-admin-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-questions.component.html',
  styleUrls: ['./admin-questions.component.css']
})
export class AdminQuestionsComponent implements OnInit {
  questions: Question[] = [];
  loading = false;
  error = '';
  answerText: Record<string, string> = {};

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.loading = true;
    this.questionService.getAllQuestions().subscribe({
      next: (questions) => {
        this.questions = questions;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'No se pudieron cargar las preguntas.';
        this.loading = false;
      }
    });
  }

  answerQuestion(question: Question): void {
    const text = this.answerText[question.id]?.trim();
    if (!text) {
      this.error = 'Ingresa una respuesta antes de publicar.';
      return;
    }

    this.questionService.answerQuestion(question.id, text, 'Admin').subscribe({
      next: () => {
        this.questionService.approveQuestion(question.id).subscribe({
          next: () => {
            this.answerText[question.id] = '';
            this.loadQuestions();
          },
          error: (err) => {
            this.error = err.error?.message || 'No se pudo aprobar la pregunta.';
          }
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'No se pudo responder la pregunta.';
      }
    });
  }
}
