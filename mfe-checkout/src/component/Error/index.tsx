import React from 'react';

interface ErrorMessageProps {
  errorMessage?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ errorMessage }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Something went wrong!</h2>
      {errorMessage && <p style={styles.message}>{errorMessage}</p>}
    </div>
  );
};

const styles = {
  container: {
    padding: '1.5rem',
    border: '1px solid #f44336',
    backgroundColor: '#fdecea',
    color: '#b71c1c',
    borderRadius: '12px',
    maxWidth: '450px',
    margin: '2rem auto',
    fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  title: {
    margin: '0 0 0.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  message: {
    margin: '0.5rem 0 0',
    fontSize: '1.25rem',
    color: '#d32f2f',
  },
};

export default ErrorMessage;