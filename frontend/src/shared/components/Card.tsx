import { ReactNode, memo } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`card-header ${className}`.trim()}>{children}</div>;
}

function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`card-body ${className}`.trim()}>{children}</div>;
}

function Card({ children, className = '' }: CardProps) {
  return <div className={`card ${className}`.trim()}>{children}</div>;
}

// Attach sub-components
Card.Header = memo(CardHeader);
Card.Body = memo(CardBody);

export default memo(Card);
