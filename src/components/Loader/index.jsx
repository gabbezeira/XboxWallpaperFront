import styles from './styles.module.scss'

export default function Loader({ text }) {
  return (
    <div className={styles.loader}>
      <div className={styles.spinner} />
      {text && <span className={styles.text}>{text}</span>}
    </div>
  )
}
