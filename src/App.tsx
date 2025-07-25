import React, { useState, useEffect } from 'react';
import './App.css'; // Import file CSS

export default function App() {
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [language, setLanguage] = useState('vi'); // 'vi' for Vietnamese, 'en' for English

  // Fetch data from the API when the component mounts
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch('https://6883552921fa24876a9da966.mockapi.io/questions');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuizData(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []); // Empty dependency array means this effect runs once on mount

  // Hàm chuyển đổi ngôn ngữ
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'vi' ? 'en' : 'vi');
  };

  // Xử lý khi người dùng chọn một đáp án
  const handleAnswerSelect = (optionKey) => {
    if (!isAnswered) {
      setSelectedAnswer(optionKey);
    }
  };

  // Xử lý khi người dùng nộp bài
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswered(true);
    if (selectedAnswer === quizData[currentQuestionIndex].correct_answer) {
      setScore(prevScore => prevScore + 1);
    }
  };

  // Chuyển sang câu hỏi tiếp theo
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  // Chơi lại từ đầu
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setLoading(true); // Optional: show loading while resetting
    // Refetch data if needed, or just reset state
    const refetch = async () => {
        try {
            const response = await fetch('https://6883552921fa24876a9da966.mockapi.io/questions');
            const data = await response.json();
            setQuizData(data);
        } catch(e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }
    refetch();
  };

  // Hàm để xác định class CSS cho các lựa chọn
  const getOptionClassName = (optionKey) => {
    let className = 'option-btn';
    if (!isAnswered) {
      if (selectedAnswer === optionKey) {
        className += ' selected';
      }
    } else {
      if (optionKey === quizData[currentQuestionIndex].correct_answer) {
        className += ' correct';
      } else if (optionKey === selectedAnswer) {
        className += ' incorrect';
      } else {
        className += ' disabled';
      }
    }
    return className;
  };

  // Giao diện tải dữ liệu
  if (loading) {
    return <div className="quiz-container"><div className="loading-text">Đang tải câu hỏi...</div></div>;
  }

  // Giao diện lỗi
  if (error) {
    return <div className="quiz-container"><div className="error-text">Lỗi tải dữ liệu: {error}</div></div>;
  }
  
  // Giao diện kết quả
  if (showResults) {
    return (
      <div className="quiz-container">
        <div className="results-card">
          <button onClick={toggleLanguage} className="lang-switch-btn">
            {language === 'vi' ? 'EN' : 'VI'}
          </button>
          <h2>{language === 'vi' ? 'Hoàn thành!' : 'Finished!'}</h2>
          <p className="results-score">
            {language === 'vi' ? 'Điểm của bạn là: ' : 'Your score is: '} 
            <span>{score}</span> / {quizData.length}
          </p>
          <button onClick={handleRestartQuiz} className="action-btn restart-btn">
            {language === 'vi' ? 'Làm lại' : 'Restart'}
          </button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = quizData[currentQuestionIndex];

  // Giao diện bài trắc nghiệm
  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <button onClick={toggleLanguage} className="lang-switch-btn">
            {language === 'vi' ? 'EN' : 'VI'}
        </button>
        {/* Phần đầu */}
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

        {/* Câu hỏi */}
        <div className="question-section">
          <h2 className="question-vi">{language === 'vi' ? currentQuestion.question_vi : currentQuestion.question_en}</h2>
        </div>

        {/* Các lựa chọn */}
        <div className="options-section">
          {currentQuestion.options.map((option) => (
            <button
              key={option.key}
              onClick={() => handleAnswerSelect(option.key)}
              disabled={isAnswered}
              className={getOptionClassName(option.key)}
            >
              <span className="option-key">{option.key}.</span>
              <span className="option-text">{language === 'vi' ? option.text_vi : option.text_en}</span>
            </button>
          ))}
        </div>

        {/* Nút Submit/Next và Giải thích */}
        <div className="footer-section">
          {isAnswered ? (
            <div>
              <div className="explanation-box">
                <h3>{language === 'vi' ? 'Giải thích:' : 'Explanation:'}</h3>
                <p>{currentQuestion.explanation_vi}</p>
              </div>
              <button onClick={handleNextQuestion} className="action-btn">
                {currentQuestionIndex < quizData.length - 1 ? (language === 'vi' ? 'Câu tiếp theo' : 'Next Question') : (language === 'vi' ? 'Xem kết quả' : 'View Results')}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="action-btn"
            >
              {language === 'vi' ? 'Trả lời' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
