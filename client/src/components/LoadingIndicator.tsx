import styles from "./LoadingIndicator.module.css";

const LoadingIndicator = () => {
  return (
    <div className={styles.container}>
      <div className={styles.loader}></div>
    </div>
  );
};

export default LoadingIndicator;
