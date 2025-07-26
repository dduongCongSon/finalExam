import { useState, useEffect, useRef } from 'react';
import './App.css'; // Import file CSS
import { QuestionService } from './services/questionsService'; 
import type { Question } from './types/questionsType';
// SVG Icons for navigation
const PrevIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const NextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const RestartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.5 12.5"/><path d="M2 12.5a10 10 0 0 0 18.5-1"/>
    </svg>
);

const MoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>
    </svg>
);

const LangIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
);


export default function App() {
  const [quizData, setQuizData] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(() => {
    const savedIndex = localStorage.getItem('currentQuestionIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>(() => {
    const savedAnswers = localStorage.getItem('userAnswers');
    return savedAnswers ? JSON.parse(savedAnswers) : {};
  });

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [language, setLanguage] = useState('vi');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await QuestionService.getAllQuestions();
        setQuizData(data);
      } catch (e: any) {
        setError(e.message || "Đã xảy ra lỗi không xác định.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, []);

  useEffect(() => {
    localStorage.setItem('currentQuestionIndex', currentQuestionIndex.toString());
  }, [currentQuestionIndex]);

  useEffect(() => {
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
  }, [userAnswers]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Effect để xử lý tự động chuyển câu
  useEffect(() => {
    // Xóa timer cũ trước khi tạo timer mới
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const submittedAnswer = userAnswers[currentQuestionIndex];
    if (submittedAnswer && quizData.length > 0) {
      const isCorrect = submittedAnswer === quizData[currentQuestionIndex].correct_answer;
      if (isCorrect) {
        timerRef.current = setTimeout(() => {
          handleNextQuestion();
        }, 2000);
      }
    }

    // Cleanup function để xóa timer khi component unmount hoặc index thay đổi
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [userAnswers, currentQuestionIndex, quizData]);


  const isCurrentQuestionAnswered = userAnswers[currentQuestionIndex] != null;

  const handleAnswerSelect = (optionKey: string) => {
    if (!isCurrentQuestionAnswered) {
      setSelectedOption(optionKey);
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: selectedOption
      }));
      setSelectedOption(null);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      setSelectedOption(null);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOption(null);
    }
  };

  const handleRestartQuiz = () => {
    localStorage.removeItem('currentQuestionIndex');
    localStorage.removeItem('userAnswers');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSelectedOption(null);
    setIsMenuOpen(false);
  };
  
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'vi' ? 'en' : 'vi');
    setIsMenuOpen(false);
  };

  const getOptionClassName = (optionKey: string) => {
    let className = 'option-btn';
    const submittedAnswer = userAnswers[currentQuestionIndex];

    if (submittedAnswer) {
      const isCorrect = optionKey === quizData[currentQuestionIndex].correct_answer;
      if (isCorrect) {
        className += ' correct';
      } else if (optionKey === submittedAnswer) {
        className += ' incorrect';
      } else {
        className += ' disabled';
      }
    } else {
      if (selectedOption === optionKey) {
        className += ' selected';
      }
    }
    return className;
  };

  if (loading) {
    return <div className="quiz-container dark-mode"><div className="loading-text">Đang tải câu hỏi...</div></div>;
  }

  if (error) {
    return <div className="quiz-container dark-mode"><div className="error-text">Lỗi tải dữ liệu: {error}</div></div>;
  }
  
  if (quizData.length === 0) {
    return <div className="quiz-container dark-mode"><div className="loading-text">Không có dữ liệu câu hỏi.</div></div>;
  }

  const currentQuestion = quizData[currentQuestionIndex];
  const submittedAnswer = userAnswers[currentQuestionIndex];
  const isCorrect = submittedAnswer === currentQuestion.correct_answer;

  return (
    <div className="quiz-container dark-mode">
      <div className="quiz-card">
        <div className="quiz-header">
            <div className="progress-section">
                <p className="progress-info">
                    {language === 'vi' ? 'Câu hỏi' : 'Question'} {currentQuestionIndex + 1} <span>/ {quizData.length}</span>
                </p>
                <div className="progress-bar-container">
                    <div 
                    className="progress-bar" 
                    style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}
                    ></div>
                </div>
            </div>
            <div className="more-menu-container" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="nav-btn icon-btn more-btn" title="More options">
                    <MoreIcon />
                </button>
                {isMenuOpen && (
                    <div className="dropdown-menu">
                        <button onClick={toggleLanguage} className="dropdown-item">
                            <LangIcon />
                            <span>{language === 'vi' ? 'English' : 'Tiếng Việt'}</span>
                        </button>
                        <button onClick={handleRestartQuiz} className="dropdown-item">
                            <RestartIcon />
                            <span>{language === 'vi' ? 'Làm lại' : 'Restart'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className="question-section">
          <h2 className="question-text">{language === 'vi' ? currentQuestion.question_vi : currentQuestion.question_en}</h2>
        </div>

        <div className="options-section">
          {currentQuestion.options.map((option) => (
            <button
              key={option.key}
              onClick={() => handleAnswerSelect(option.key)}
              disabled={isCurrentQuestionAnswered}
              className={getOptionClassName(option.key)}
            >
              <span className="option-key">{option.key}</span>
              <span className="option-text">{language === 'vi' ? option.text_vi : option.text_en}</span>
            </button>
          ))}
        </div>
        
        {isCurrentQuestionAnswered && (
            <div className="explanation-box">
                {isCorrect && (
                    <div className="auto-advance-timer">
                        <div className="timer-bar-fill"></div>
                    </div>
                )}
                <h3>{language === 'vi' ? 'Giải thích:' : 'Explanation:'}</h3>
                <p>{currentQuestion.explanation_vi}</p>
            </div>
        )}

        <div className="footer-navigation">
            <button 
                onClick={handlePrevQuestion} 
                disabled={currentQuestionIndex === 0}
                className="nav-btn icon-btn"
                aria-label="Previous Question"
            >
                <PrevIcon />
            </button>

            {!isCurrentQuestionAnswered && (
                <button 
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className="nav-btn submit-btn"
                >
                    {language === 'vi' ? 'Trả lời' : 'Submit'}
                </button>
            )}

            {isCurrentQuestionAnswered && !isCorrect && (
                <button 
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === quizData.length - 1}
                    className="nav-btn submit-btn incorrect-next-btn"
                >
                    {language === 'vi' ? 'Tiếp theo' : 'Next'}
                </button>
            )}

            <button 
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === quizData.length - 1}
                className={`nav-btn icon-btn ${isCurrentQuestionAnswered ? 'hidden' : ''}`}
                aria-label="Next Question"
            >
                <NextIcon />
            </button>
        </div>
      </div>
    </div>
  );
}
