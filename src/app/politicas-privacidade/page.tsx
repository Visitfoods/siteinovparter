import React from 'react';
import styles from './page.module.css';

export default function PoliticasPrivacidade() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Política de Privacidade – Inov Partner</h1>
        
        <div className={styles.intro}>
          <p>
            A Inov Partner, agência de multimédia e inteligência artificial, com sede em Rua Álvaro Pires Miranda, nº 270-B, 2415-369 Marrazes, Leiria, Portugal, NIF 514877731, compromete-se a proteger a privacidade dos utilizadores do seu website e a garantir a confidencialidade dos dados pessoais recolhidos.
          </p>
          <p>
            Esta Política de Privacidade explica como recolhemos, utilizamos, armazenamos e protegemos os dados pessoais dos utilizadores, em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD) e demais legislação aplicável.
          </p>
        </div>

        <section className={styles.section}>
          <h2>1. Dados recolhidos</h2>
          <p>Podemos recolher as seguintes categorias de dados:</p>
          <ul>
            <li><strong>Dados fornecidos pelo utilizador:</strong> informações partilhadas em formulários de contacto ou outros meios de comunicação.</li>
            <li><strong>Dados técnicos:</strong> endereço IP, tipo de dispositivo, navegador, sistema operativo, cookies e dados de utilização do site.</li>
            <li><strong>Dados derivados da utilização do website:</strong> interações com páginas e conteúdos e preferências de utilização.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>2. Finalidade do tratamento</h2>
          <p>Os dados pessoais são utilizados para:</p>
          <ul>
            <li>Assegurar o funcionamento e melhoria contínua da plataforma.</li>
            <li>Responder a pedidos de informação e prestar apoio aos utilizadores.</li>
            <li>Melhorar os nossos serviços e a experiência de utilização.</li>
            <li>Cumprir obrigações legais ou regulamentares.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Base legal do tratamento</h2>
          <p>O tratamento dos dados é realizado com base em:</p>
          <ul>
            <li>Consentimento do utilizador.</li>
            <li>Execução de contrato ou prestação de serviços.</li>
            <li>Interesse legítimo da Inov Partner (ex.: segurança da plataforma, prevenção de abusos).</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Partilha de dados</h2>
          <p>Os dados podem ser partilhados com:</p>
          <ul>
            <li>Prestadores de serviços tecnológicos (ex.: alojamento, fornecedores de API de IA).</li>
            <li>Autoridades competentes, sempre que exigido por lei.</li>
          </ul>
          <p>Garantimos que os terceiros cumprem o RGPD e que os dados são tratados apenas para os fins acordados.</p>
        </section>

        <section className={styles.section}>
          <h2>5. Conservação dos dados</h2>
          <ul>
            <li>Os dados de utilização do website poderão ser armazenados por um período limitado, apenas para efeitos de melhoria dos serviços.</li>
            <li>Após esse período, os dados serão eliminados ou anonimizados.</li>
            <li>O tempo de retenção pode variar conforme obrigações legais específicas.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Segurança dos dados</h2>
          <p>
            Adotamos medidas técnicas e organizativas adequadas para proteger os dados pessoais contra acesso não autorizado, perda, alteração ou divulgação indevida.
          </p>
          <p>
            Contudo, alertamos os utilizadores para não partilharem informações sensíveis (como dados de saúde, financeiros ou identificativos oficiais) no chatbot.
          </p>
        </section>

        

        <section className={styles.section}>
          <h2>8. Direitos dos titulares</h2>
          <p>Nos termos da lei, os utilizadores têm direito a:</p>
          <ul>
            <li>Aceder aos seus dados pessoais.</li>
            <li>Corrigir dados incorretos ou desatualizados.</li>
            <li>Solicitar a eliminação dos dados.</li>
            <li>Limitar ou opor-se ao tratamento.</li>
            <li>Solicitar a portabilidade dos dados.</li>
          </ul>
          <p>
            Para exercer estes direitos, o utilizador pode contactar-nos através de{' '}
            <a href="mailto:geral@inovpartner.com" className={styles.link}>
              geral@inovpartner.com
            </a>{' '}
            ou pelo telefone{' '}
            <a href="tel:+351915700200" className={styles.link}>
              +351 915 700 200
            </a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Cookies e tecnologias semelhantes</h2>
          <p>O nosso website pode utilizar cookies para:</p>
          <ul>
            <li>Garantir o correto funcionamento da plataforma.</li>
            <li>Melhorar a navegação e experiência do utilizador.</li>
            <li>Analisar estatísticas de utilização.</li>
          </ul>
          <p>O utilizador pode gerir as suas preferências de cookies através das definições do navegador.</p>
        </section>

        <section className={styles.section}>
          <h2>10. Alterações à Política de Privacidade</h2>
          <p>
            A Inov Partner reserva-se o direito de atualizar esta Política de Privacidade sempre que necessário. As alterações serão comunicadas através do website.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. Contactos</h2>
          <div className={styles.contactInfo}>
            <p><strong>Inov Partner</strong></p>
            <p>Rua Álvaro Pires Miranda, nº 270-B</p>
            <p>2415-369 Marrazes, Leiria – Portugal</p>
            <p>
              📧{' '}
              <a href="mailto:geral@inovpartner.com" className={styles.link}>
                geral@inovpartner.com
              </a>
            </p>
            <p>
              📞{' '}
              <a href="tel:+351915700200" className={styles.link}>
                +351 915 700 200
              </a>
            </p>
            <p>NIF: 514877731</p>
          </div>
        </section>

        <div className={styles.backButton}>
          <a href="/" className={styles.backLink}>
            ← Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}
