import React, { useState, useCallback, useEffect } from 'react';
import SpeechToText from './components/SpeechToText';
import { StreamingText } from './components/StreamingText';
import { QuestionDisplay } from './components/QuestionDisplay';
import { QuestionGenerator } from './services/QuestionGenerator';

const WORDS_THRESHOLD = 30;
const QUESTION_DISPLAY_TIME = 10000; // 10 seconds

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleSpeechResult = useCallback((result: string) => {
    setText(prevText => {
      const newText = (prevText + ' ' + result).trim();
      setDebugInfo(`Current text: ${newText}`);
      const wordCount = newText.split(' ').length;
      
      if (wordCount >= WORDS_THRESHOLD) {
        generateQuestion(newText);
        return '';
      }
      
      return newText;
    });
  }, []);

  const generateQuestion = useCallback(async (context: string) => {
    setDebugInfo(`Generating question for context: ${context}`);
    try {
      const question = await QuestionGenerator.generate(context);
      setQuestions(prev => [...prev, question]);
      setDebugInfo(`Question generated: ${question}`);
      
      setTimeout(() => {
        setQuestions(prev => prev.slice(1));
      }, QUESTION_DISPLAY_TIME);
    } catch (error) {
      setDebugInfo(`Error generating question: ${error}`);
    }
  }, []);

  const toggleListening = () => {
    setIsListening(!isListening);
    setDebugInfo(`Listening toggled: ${!isListening}`);
  };

  useEffect(() => {
    if (isListening) {
      setDebugInfo('Started listening...');
    } else {
      setDebugInfo('Stopped listening.');
    }
  }, [isListening]);

  return (
    <div className="thought-provoker-app" style={{ padding: '20px' }}>
      <h1>Thought Provoker AI</h1>
      <button onClick={toggleListening}>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <SpeechToText onResult={handleSpeechResult} isListening={isListening} />
      <StreamingText text={text} /> {/* Pass the updated text */}
      <QuestionDisplay questions={questions} />
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>Debug Info:</h3>
        <pre>{debugInfo}</pre>
      </div>
    </div>
  );
};

export default App;
