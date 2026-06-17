import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Accommodation } from '../../models/accommodation.model';
import { AccommodationService } from '../../services/accommodation.service';
import { QuestionService } from '../../services/question.service';
import { AuthService } from '../../services/auth.service';
import { QuestionRequest, Question } from '../../models/question.model';

@Component({
  selector: 'app-accommodation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="detail" *ngIf="!loading && accommodation">
      <h2>{{accommodation.name}}</h2>
      <img [src]="accommodation.photoUrls?.[0] || '/assets/placeholder.png'" alt="{{accommodation.name}}"/>
      <p>{{accommodation.description}}</p>
      <p><strong>Ubicación:</strong> {{accommodation.location}}</p>
      <p><strong>Capacidad:</strong> {{accommodation.capacity}}</p>
      <p><strong>Precio por noche:</strong> {{ accommodation.pricePerNight | currency:'USD' }}</p>
      <button (click)="reserve()">Reservar</button>

      <hr />
      <section class="questions">
        <h3>Preguntas y respuestas</h3>
        <div *ngFor="let q of questions">
          <p><strong>{{q.userName}}</strong> dijo: {{q.questionText}}</p>
          <div *ngIf="q.answerText"><em>Respuesta: {{q.answerText}} — {{q.answeredBy}}</em></div>
        </div>

        <div *ngIf="currentUser">
          <h4>¿Tienes una pregunta?</h4>
          <textarea [(ngModel)]="newQuestionText" rows="3" cols="60"></textarea>
          <br/>
          <button (click)="submitQuestion()">Enviar pregunta</button>
          <div *ngIf="questionMessage">{{questionMessage}}</div>
        </div>
        <div *ngIf="!currentUser">Inicia sesión para hacer una pregunta.</div>
      </section>
    </div>
    <div *ngIf="loading">Cargando...</div>
  `
})
export class AccommodationDetailComponent implements OnInit {
  accommodation: Accommodation | null = null;
  loading = false;
  id = '';
  questions: Question[] = [];
  newQuestionText = '';
  questionMessage = '';
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private service: AccommodationService,
    private questionService: QuestionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.currentUser = this.authService.currentUserValue;
    if (this.id) this.load();
  }

  load() {
    this.loading = true;
    this.service.getAccommodation(this.id).subscribe({ next: (r) => { this.accommodation = r; this.loading = false; this.loadQuestions(); }, error: () => { this.loading = false; } });
  }

  loadQuestions() {
    if (!this.id) return;
    this.questionService.getQuestionsByAccommodation(this.id).subscribe({ next: (q) => { this.questions = q; }, error: () => { this.questions = []; } });
  }

  submitQuestion() {
    const user = this.authService.currentUserValue;
    if (!user) { this.questionMessage = 'Debes iniciar sesión para preguntar.'; return; }
    if (!this.newQuestionText || !this.id) { this.questionMessage = 'Escribe tu pregunta antes de enviar.'; return; }
    const req: QuestionRequest = { userId: user.id, userName: user.fullName || user.email, accommodationId: this.id, questionText: this.newQuestionText };
    this.questionService.createQuestion(req).subscribe({ next: () => { this.questionMessage = 'Pregunta enviada.'; this.newQuestionText = ''; this.loadQuestions(); }, error: (err) => { this.questionMessage = err.error?.message || 'Error al enviar pregunta.'; } });
  }

  reserve() {
    // Navigate to guest booking page
    this.router.navigate(['/guest/book', this.id]);
  }
}
