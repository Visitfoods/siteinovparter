// Dados estáticos para a aplicação
// Substitui os dados que anteriormente vinham do Firebase

export interface ChatConfig {
  welcomeTitle?: string | null;
  button1Text?: string | null;
  button1Function?: string | null;
  button2Text?: string | null;
  button2Function?: string | null;
  button3Text?: string | null;
  button3Function?: string | null;
  downloadVideoEnabled?: boolean | null;
}

export interface HelpPoints {
  point1?: string | null;
  point2?: string | null;
  point3?: string | null;
  point4?: string | null;
  point5?: string | null;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  name: string;
  questions: FaqItem[];
}

export interface ContactInfo {
  phoneNumber: string;
  address: string;
  callUsTitle: string;
  callUsDescription: string;
  visitUsTitle: string;
  visitUsDescription: string;
  liveChatTitle: string;
  liveChatDescription: string;
  liveChatButtonText: string;
  mapEmbedUrl: string;
  email?: string | null;
}

export interface GuideVideos {
  backgroundVideoURL: string | null;
  welcomeVideoURL: string | null;
  systemPrompt: string | null;
  chatConfig?: ChatConfig | null;
  helpPoints?: HelpPoints | null;
  humanChatEnabled?: boolean | null;
  faq?: FaqCategory[] | null;
  contactInfo?: ContactInfo | null;
  chatIconURL?: string | null;
  captions?: { desktop?: string | null; tablet?: string | null; mobile?: string | null } | null;
}

export interface GuideData {
  name?: string;
  backgroundVideoURL?: string;
  welcomeVideoURL?: string;
  systemPrompt?: string;
  isActive?: boolean;
  chatConfig?: ChatConfig | null;
  helpPoints?: HelpPoints | null;
  humanChatEnabled?: boolean | null;
  faq?: FaqCategory[] | null;
  contactInfo?: ContactInfo | null;
  chatIconURL?: string | null;
  captions?: { desktop?: string | null; tablet?: string | null; mobile?: string | null } | null;
  metaTitle?: string;
  metaDescription?: string;
}

// Dados estáticos para o guia "Inov Partner"
export const staticGuideData: Record<string, GuideData> = {
  "inovpartner": {
    name: "Inov Partner",
    backgroundVideoURL: "/videos da pagina/background.mp4",
    welcomeVideoURL: "/videos da pagina/videoprincipal.mp4",
    systemPrompt: `[INÍCIO SISTEMA: CONFIGURAÇÃO "Tiago — Assistente da Inov Partner"]

Identificação
• Nome da agente: Tiago
• Função: Assistente oficial da Inov Partner — agência de multimédia e inteligência artificial.
• Audiência: Empresas, instituições públicas e privadas, marcas, turismo, comércio, indústria, saúde, educação e serviços.
• Linguagem: Português de Portugal europeu, ortografia e conjugação corretas. Fala SEMPRE em português de Portugal europeu, sem verbos, expressões ou construções do português do Brasil.

Objetivos Principais
1. Explicar claramente o que a Inov Partner faz e em que ajuda (multimédia e inteligência artificial aplicada à comunicação).
2. Aconselhar soluções adequadas para turismo, comércio, indústria, saúde, educação e serviços.
3. Orientar pedidos comerciais: recolher apenas informação essencial e apresentar um botão para abrir o Guia Real em caso de pedido de orçamento.
4. Apoiar comunicação sobre campanhas digitais, guias virtuais, vídeos e outras soluções multimédia.
5. Se faltar informação, assumir transparência e indicar o passo seguinte (contacto, orçamento, consulta técnica).

Dados Operacionais
• Entidade: Inov Partner — Agência de Multimédia e Inteligência Artificial.
• Morada: Rua Álvaro Pires Miranda, nº 270-B, 2415-369 Marrazes, Leiria, Portugal.
• Contactos: +351 915 700 200 | geral@inovpartner.com
• Site: www.inovpartner.com
• Atendimento: via telefone, email ou formulário online.
• Áreas de atuação: Portugal e internacional (sob pedido).

Quem Somos (essencial)
• Agência especializada em multimédia e inteligência artificial.
• Desenvolve soluções digitais inovadoras para comunicação, promoção e interação.
• Experiência em diversos setores (turismo, comércio, indústria, saúde, educação e serviços).
• Foco em inovação tecnológica, personalização e impacto visual.

Empresas com quem a Inov Partner já trabalhou
• Município de Santarém
• Município de Leiria
• Município da Chamusca 
• Município de Ferreira do Zêzere 
• Município de Campo Maior
• Quinta da Logoalva
• Companhia Portuguesa
• Betano 
• Iqos
• Alxama
• Festival Nacional da Gastronomia 
• Alves Bandeira
• O Meu Doutor 
• Portugal dos Pequenitos 
• Panidor 

Serviços & Portfolio
1. Guia Virtual movido a Inteligência Artificial - Virtualguide
   o Assistente interativo que orienta utilizadores na exploração de locais, produtos ou serviços.
   o Aplicável em turismo, comércio, saúde, educação, indústria e serviços.
   o Permite divulgação de informação de forma dinâmica, acessível e envolvente.

2. Vídeos Históricos e Biográficos com AI - VirtualStory
   o Criação de conteúdos audiovisuais que contam a história de uma marca, pessoa, localidade ou empresa.
   o Produção assistida por inteligência artificial para maior realismo e impacto.
   o Indicados para promoção institucional, museus, storytelling de marcas ou homenagens.

3. Postal Turístico em Papel e Digital - Visitpostal
   o Formato híbrido que une físico e digital, permitindo a apresentação de conteúdos multimédia interativos.
   o Pode integrar vídeos, animações e experiências imersivas.
   o Ideal para turismo, cidades, património cultural e campanhas de marketing diferenciadoras.

4. Campanha Boost (Publicidade Digital com AI)
   o Estratégia para aumentar a visibilidade nas redes sociais.
   o Baseada em conteúdos multimédia criados com inteligência artificial.
   o Indicada para marcas que procuram reforçar notoriedade, atrair clientes e dinamizar eventos.

5. Soluções Personalizadas em AI
   o Desenvolvimento de projetos à medida das necessidades específicas de cada cliente.
   o Combinação de multimédia e inteligência artificial para desafios únicos.
   o Abrange desde comunicação empresarial até experiências imersivas exclusivas.

Comportamento Conversacional
• Tom profissional, claro e orientado a ação.
• Uma pergunta de cada vez; respostas concisas, oferecendo "aprofundar" como opção.
• Confirmar: setor do cliente, objetivo da comunicação, prazo, público-alvo.

Políticas & Restrições
• Não inventar preços, prazos ou condições não publicados.
• Não fornecer orçamentos diretos.
• Usar sempre o botão do Guia Real para pedidos comerciais.
• Privacidade/GDPR: recolher apenas dados mínimos.
• Não inventar ou acrescentar informação sobre os serviços da Inov Partner.
• Não inventar ou acrescentar informação sobre os tempos de execução dos serviços.
• O guia nunca pode dizer que vai "ligar o guia real"
• O guia nunca pode dizer "[Mostrar botão para abrir o Guia Real]"
• Proibir racismo, xenofobia, homofobia, misoginia, etc.
• Bloquear pedidos de instruções sobre armas, explosivos, ataques, etc.
• Prevenir incentivo a suicídio, automutilação ou uso perigoso de substâncias.
• Não Responder com expressões brasileiras.
• Não utilizar expressões em gerúndio.

Fluxos de Interação Recomendados

B) Campanhas e Comunicação Digital
• Orientar e esclarecer.

C) Projetos Setoriais
• Recomendar soluções.

D) Suporte Pós-venda/Projeto
• Ajudar em dúvidas técnicas.

Perguntas Frequentes (gestão automática)
• "O que fazem?" → Agência de multimédia e inteligência artificial; soluções digitais interativas e personalizadas.
• "Que serviços oferecem?" → Guia virtual, vídeos históricos/biográficos, postais turísticos, campanhas digitais, soluções AI personalizadas.
• "Trabalham com turismo/saúde/educação/etc.?" → Sim; adaptar soluções a diferentes setores.

Always Respond in European Portuguese

[FINAL SISTEMA]`,
    isActive: true,
    chatConfig: {
      welcomeTitle: "BEM-VINDO À INOV PARTNER",
      button1Text: "O que é a Inov Partner?",
      button1Function: "Explica-me o que é a Inov Partner e os serviços que oferece.",
      button2Text: "Serviços de IA",
      button2Function: "Quais são os serviços de inteligência artificial que oferecem?",
      button3Text: "Multimédia",
      button3Function: "Que serviços de multimédia estão disponíveis?",
      downloadVideoEnabled: true
    },
    helpPoints: {
      point1: "Faça perguntas sobre a Inov Partner",
      point2: "Peça informações sobre serviços de IA",
      point3: "Descubra soluções de multimédia",
      point4: "Tire dúvidas sobre projetos digitais",
      point5: "Saiba mais sobre o Virtualguide"
    },
    humanChatEnabled: true,
    faq: [
      {
        name: "Geral",
        questions: [
          {
            question: "O que é a Inov Partner?",
            answer: "A Inov Partner é uma agência de multimédia e inteligência artificial especializada em soluções digitais inovadoras. Oferecemos serviços de IA, desenvolvimento multimédia e consultoria tecnológica para empresas."
          },
          {
            question: "Que serviços de IA oferecem?",
            answer: "Oferecemos soluções inovadoras baseadas em inteligência artificial, que incluem o VirtualGuide (assistente virtual interativo), o VirtualStory (vídeos históricos e biográficos criados com IA), o VisitPostal (postais turísticos físicos e digitais com conteúdos multimédia), a Campanha Boost (publicidade digital para reforço de marca) e Serviços Personalizados de inteligência artificial adaptados a cada setor."
          },
          {
            question: "Que serviços de multimédia estão disponíveis?",
            answer: "Desenvolvemos conteúdo multimédia interativo (fotografias, vídeos, animações, etc.) criados com IA, que podem ser usados em diversas plataformas digitais."
          }
        ]
      },
      {
        name: "Técnico",
        questions: [
          {
            question: "Que tecnologias utilizam?",
            answer: "Utilizamos tecnologias de ponta como inteligência artificial generativa, processamento de linguagem natural, machine learning, desenvolvimento web moderno, realidade virtual e aumentada, e ferramentas de análise de dados avançadas."
          },
          {
            question: "Os projetos funcionam em dispositivos móveis?",
            answer: "Sim, todas as nossas soluções são desenvolvidas com design responsivo e funcionam perfeitamente em smartphones, tablets, computadores e outros dispositivos."
          },
          {
            question: "É necessário instalar software adicional?",
            answer: "Depende do projeto. Muitas das nossas soluções funcionam diretamente no navegador, mas também desenvolvemos aplicações nativas quando necessário para uma melhor experiência do usuário."
          }
        ]
      },
      {
        name: "Implementação",
        questions: [
          {
            question: "Quanto tempo leva para desenvolver um projeto?",
            answer: "O tempo de desenvolvimento varia conforme a complexidade do projeto. Soluções simples podem estar prontas em algumas semanas, enquanto projetos mais complexos podem levar alguns meses. Fornecemos sempre cronogramas detalhados."
          },
          {
            question: "É possível personalizar as soluções para a nossa marca?",
            answer: "Sim, todas as nossas soluções são totalmente personalizáveis. Adaptamos a aparência, funcionalidades, integrações e experiência do usuário para alinhar perfeitamente com a identidade da sua marca e objetivos específicos."
          },
          {
            question: "Que tipo de suporte oferecem após a entrega?",
            answer: "Oferecemos suporte técnico contínuo, manutenção preventiva, atualizações regulares, treinamento da equipa e consultoria estratégica para otimizar e expandir as soluções ao longo do tempo."
          }
        ]
      },
      {
        name: "Serviços",
        questions: [
          {
            question: "O que é o Virtualguide?",
            answer: "Guia virtual, movido em AI, que orienta os utilizadores na exploração de locais, produtos ou serviços de forma interativa."
          },
          {
            question: "Como funciona o Virtualguide?",
            answer: "O processo tem 4 etapas: 1. Escolha da informação a divulgar. 2. Desenvolvimento do VirtualGuide. 3. Instalação dos suportes de comunicação. 4. Campanha de lançamento."
          },
          {
            question: "Em que setores pode ser aplicado o Virtualguide?",
            answer: "O Virtualguide pode ser usado em: Turismo, Comércio, Indústria, Saúde, Educação e Serviços."
          },
          {
            question: "Quais as vantagens do Virtualguide?",
            answer: "Disponibiliza informação de forma dinâmica e acessível. Cria uma experiência personalizada e envolvente. Ajuda a comunicar produtos, serviços ou património de forma inovadora."
          },
          {
            question: "É possível personalizar o Virtualguide?",
            answer: "Sim. A informação a divulgar é escolhida pelo cliente e o Guia é desenvolvido de acordo com o objetivo e o setor de aplicação."
          },
          {
            question: "O Guia Virtual fala em vários idiomas?",
            answer: "Sim. Pode ser configurado em diferentes línguas, permitindo alcançar públicos internacionais."
          },
          {
            question: "O que é o VirtualStory?",
            answer: "Vídeos históricos e biográficos criados com AI que permitem contar a história de uma marca, localidade, pessoa ou empresa."
          },
          {
            question: "O que é o Virtualpostal?",
            answer: "Postal turístico em papel e digital que permite a apresentação de conteúdos multimédia criados com AI."
          },
          {
            question: "O que é a Campanha Boost?",
            answer: "Campanha publicitária para aumentar a visibilidade nas redes sociais através de conteúdos multimédia criados com AI."
          },
          {
            question: "O que são soluções personalizadas?",
            answer: "Soluções personalizadas, criadas com base em AI, que se adaptam às necessidades específicas de cada cliente."
          }
        ]
      }
    ],
    contactInfo: {
      phoneNumber: "+351 915 700 200",
      address: "Rua Álvaro Pires Miranda 270, 2415-369 Leiria",
      callUsTitle: "Contacte-nos",
      callUsDescription: "A nossa equipa está disponível em dias úteis das 9h às 18h.",
      visitUsTitle: "Visite-nos",
      visitUsDescription: "A nossa sede está localizada em Leiria. Agende uma visita para conhecer os nossos serviços.",
      liveChatTitle: "Chat em Tempo Real",
      liveChatDescription: "Converse com um dos nossos especialistas para tirar as suas dúvidas imediatamente.",
      liveChatButtonText: "Iniciar Chat",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3070.7559300776387!2d-8.822899323540506!3d39.74881897154771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd22735905c4507f%3A0x400ebbde4902160!2sR.%20%C3%81lvaro%20Pires%20Miranda%20270%2C%202415-369%20Leiria!5e0!3m2!1spt-PT!2spt!4v1710347161099!5m2!1spt-PT!2spt",
      email: "geral@inovpartner.com"
    },
    chatIconURL: "/iconchat.jpg",
    captions: {
      desktop: "/videos da pagina/Legendas pc.vtt",
      tablet: "/videos da pagina/Legendas Tablet.vtt",
      mobile: "/videos da pagina/Legendas Mobile.vtt"
    },
    metaTitle: "Inov Partner - Agência de Multimédia e Inteligência Artificial",
    metaDescription: "Inov Partner é uma agência especializada em soluções de multimédia e inteligência artificial. Desenvolvemos assistentes virtuais, plataformas web e soluções digitais inovadoras."
  }
};

// Função para obter os dados estáticos de um guia específico
export function getStaticGuideData(guideSlug: string): GuideData | null {
  return staticGuideData[guideSlug] || null;
}
