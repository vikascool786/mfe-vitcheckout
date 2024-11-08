import React from "react";
import ErrorBoundary from "../error-boundary/ErrorBoundary";
import Spinner from "react-bootstrap/Spinner";
import Container from "react-bootstrap/Container";

const defaultFallback = (
  <Container
    className="d-flex justify-content-center align-items-center"
    style={{ height: "100vh" }}
  >
    <Spinner animation="border" variant="primary" />
  </Container>
);

interface RemoteWrapperProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  hideErrorBoundry?: boolean;
}

const RemoteWrapper: React.FC<RemoteWrapperProps> = ({
  fallback = null,
  hideErrorBoundry = false,
  children,
}) => {
  return (
    <ErrorBoundary errorWrapperContent={hideErrorBoundry ? <></> : undefined}>
      <React.Suspense fallback={fallback ?? defaultFallback}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
};

export default RemoteWrapper;
