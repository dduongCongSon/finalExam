import type { Question } from '../types/questionsType';

const API_URL = 'https://6883552921fa24876a9da966.mockapi.io/questions';

export const QuestionService = {
  async getAllQuestions(): Promise<Question[]> {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Lỗi mạng: ${response.status} - ${response.statusText}`);
      }

      const data: Question[] = await response.json();
      return data;
    } catch (error) {
      console.error("Không thể lấy dữ liệu câu hỏi:", error);
      throw new Error("Không thể tải dữ liệu câu hỏi từ máy chủ.");
    }
  }
};