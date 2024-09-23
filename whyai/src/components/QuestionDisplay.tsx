import React from 'react';

interface QuestionDisplayProps {
  questions: string[];
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ questions }) => {
  return (
    <div className="questions-container">
      {questions.map((question, index) => (
        <div key={index} className="question">
          {question}
        </div>
      ))}
    </div>
  );
};