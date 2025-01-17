import React from 'react';
import './withLoader.css';

interface WithLoaderProps {
  loading: boolean;
}

const withLoader = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithLoaderProps> => {
  return ({ loading, ...props }: WithLoaderProps & P) => (
    <div className="with-loader-container">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <WrappedComponent {...(props as P)} />
    </div>
  );
};

export default withLoader;