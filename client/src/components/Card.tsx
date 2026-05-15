import styles from "./Card.module.css";

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`${styles.container} ${className}`}>{children}</div>;
};

export default Card;
