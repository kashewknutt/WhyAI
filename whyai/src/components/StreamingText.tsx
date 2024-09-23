import React, { useEffect, useRef } from 'react';

interface StreamingTextProps {
  text: string;
}

export const StreamingText: React.FC<StreamingTextProps> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="streaming-text"
      style={{
        height: '200px',
        overflowY: 'auto',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ccc',
        borderRadius: '5px',
        marginTop: '20px',
        whiteSpace: 'pre-wrap',
      }}
    >
      {text.trim() ? text : <span style={{ color: '#888' }}>Start speaking, your words will appear here...</span>}
    </div>
  );
};
