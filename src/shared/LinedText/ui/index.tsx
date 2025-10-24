import './lined-text.scss';

export const LinedText: React.FC<{
  As: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  onClick?(): void;
}> = ({ As, className, children, onClick }) => (
  <As className={`${className} with-lines`} onClick={onClick}>
    <span>{children}</span>
  </As>
);
