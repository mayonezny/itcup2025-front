import './lined-text.scss';

export const LinedText: React.FC<{
  As: React.ElementType;
  className?: string;
  children?: React.ReactNode;
}> = ({ As, className, children }) => (
  <As className={`${className} with-lines`}>
    <span>{children}</span>
  </As>
);
