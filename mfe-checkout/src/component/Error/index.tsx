import React from 'react';

interface ErrorMessageProps {
  errorMessage?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ errorMessage }) => {
  console.log(errorMessage)
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Something went wrong.</h2>
      {errorMessage && <p style={styles.message}>{errorMessage}</p>}
    </div>
  );
};

const styles = {
  container: {
    padding: '1rem',
    border: '1px solid #f44336',
    backgroundColor: '#fdecea',
    color: '#d32f2f',
    borderRadius: '8px',
    maxWidth: '400px',
    margin: '1rem auto',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  message: {
    margin: '0.5rem 0 0',
    fontSize: '1rem',
  },
};

export default ErrorMessage;