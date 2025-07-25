export interface Option {
  key: string;
  text_en: string;
  text_vi: string;
}

export interface Question {
  id: string;
  question_en: string;
  question_vi: string;
  options: Option[];
  correct_answer: string;
  explanation_vi: string;
}