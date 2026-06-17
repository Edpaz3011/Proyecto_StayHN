export interface Question {
  id: string;
  userId: string;
  userName: string;
  accommodationId: string;
  questionText: string;
  answerText?: string;
  answeredBy?: string;
  questionDate: Date;
  answerDate?: Date;
  isApproved: boolean;
}

export interface QuestionRequest {
  userId: string;
  userName: string;
  accommodationId: string;
  questionText: string;
}





