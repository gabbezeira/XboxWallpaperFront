import styles from './styles.module.scss';

export default function Terms() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Termos de Uso & Aviso Legal</h1>
        
        <section className={styles.section}>
          <h2>Aviso de Isenção de Responsabilidade</h2>
          <p>
            O <strong>TheXboxApp</strong> é um projeto independente, sem fins lucrativos e desenvolvido estritamente por fãs da plataforma Xbox.
          </p>
          <p>
            Este site <strong>não é</strong> afiliado, associado, autorizado, endossado por ou de qualquer forma oficialmente conectado à Microsoft Corporation, Xbox, ou qualquer uma de suas subsidiárias ou afiliadas.
          </p>
          <p>
            Os nomes Xbox, bem como nomes, marcas, emblemas e imagens relacionadas são marcas registradas de seus respectivos proprietários. O uso de tais marcas é feito apenas para fins de identificação e referência, sem qualquer intenção de violação de direitos autorais.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Sobre o Projeto</h2>
          <p>
            A plataforma foi idealizada e desenvolvida por <strong>Gabriel Alves</strong>, também conhecido na comunidade como <strong>@gabbezeira</strong>.
          </p>
          <p>
            O principal objetivo deste projeto é fornecer uma experiência aprimorada e centralizada para que a comunidade de jogadores possa encontrar e gerenciar seus wallpapers favoritos do Xbox.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Uso de Dados</h2>
          <p>
            Nós respeitamos sua privacidade. Os dados coletados através da autenticação Microsoft são utilizados única e exclusivamente para permitir que você salve seus wallpapers favoritos e envie novas mídias para a galeria da comunidade.
          </p>
        </section>
        
        <footer className={styles.footer}>
          <p>© 2026 TheXboxApp • Desenvolvido por @gabbezeira</p>
        </footer>
      </div>
    </div>
  );
}
