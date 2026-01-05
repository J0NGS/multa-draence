# ⚽ Draence Calculator

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Version](https://img.shields.io/badge/Version-3.5-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

**Simulador Estratégico de Multas Rescisórias e Contratos para o RPG Draence**

[Acessar Calculadora Online](https://j0ngs.github.io/draence-calculator) •
[Funcionalidades](#-funcionalidades) •
[Lógica de Cálculo](#-lógica-e-matemática) •
[Tecnologias](#-tecnologias)

</div>

---

## 📋 Sobre o Projeto

**Draence Calculator** é uma ferramenta de suporte à decisão desenvolvida para managers da liga de futebol RPG **Draence**. Diferente de calculadoras simples, este sistema simula o comportamento do mercado e a psicologia dos jogadores, permitindo traçar estratégias contratuais complexas.

O sistema utiliza conceitos de **Pesquisa Operacional** e **Teoria dos Jogos** para determinar se uma proposta financeira é vantajosa (Superávit) ou ofensiva (Déficit), ajustando a multa rescisória dinamicamente.

### Propósito

A ferramenta permite:
-  **Cálculo de VTC (Valor Total do Contrato):** Análise do custo real somando salários e luvas diluídas no tempo.
-  **Perfis Psicológicos:** Simulação de 4 arquétipos de negociação (Padrão, Mercenário, Fiel, Ambicioso).
-  **Detecção de Déficit:** Alerta visual e penalidade na multa caso a oferta esteja abaixo do mercado.
-  **Dashboard Analítico:** Visualização da composição matemática da multa em blocos didáticos.
-  **Conversão Real-Time:** Exibição simultânea de valores em BRL (Real) e EUR (Euro).

### 👨‍💻 Desenvolvedor

**João Gonçalo (J0NGS)**
- 📧 Email: jnetogoncalo@gmail.com
- 🔗 GitHub: [@J0NGS](https://github.com/J0NGS)

---

## 🏗️ Estrutura do Projeto

O projeto foi construído com foco em performance e manutenibilidade, utilizando **Vanilla JS** moderno sem dependências externas pesadas.

### 📁 Diretórios

```text
Draence-Calculator/
│
├── index.html          # Dashboard principal (Calculadora)
├── como-funciona.html  # Guia do Manager (Documentação didática)
├── style.css           # Estilos globais, temas e responsividade
├── script.js           # Core lógico (Cálculos, DOM, Events)
├── dados_inline.js     # Base de dados (Mock) de Salários e Mercado
└── pes_drae.png        # Assets visuais
```

---

## 🧠 Lógica e Matemática

A calculadora opera baseada na premissa de **"Cabo de Guerra Financeiro"**.

### A Regra de Ouro (VTC)
O sistema não olha apenas o salário mensal. Ele calcula o pacote completo:

`VTC = (Salário × 12 × Anos) + Luvas`

### O Algoritmo de Decisão
1.  **Verificação de Déficit:** Se o `VTC Oferecido` < `VTC Base`, o sistema ignora o lucro desejado e penaliza a multa abaixo do valor de mercado.
2.  **Cálculo de Superávit:** Se a oferta for boa, aplicam-se pesos ponderados:
    * **Salário:** Peso alto (Estabilidade).
    * **Luvas:** Peso médio/baixo (Diluído pelo tempo).
    * **Reputação:** Delta entre o prestígio do time e do jogador.
3.  **Ajuste de Perfil:** O multiplicador final é refinado pelo arquétipo escolhido (Ex: *Mercenários* valorizam mais as luvas que o salário).

---

## 🚀 Tecnologias

### Front-end
- **HTML5** - Estrutura semântica.
- **CSS3** - Layout responsivo com Flexbox/Grid, Variáveis CSS (Custom Properties) e Design System "Dark Slate".
- **JavaScript (ES6+)** - Lógica de cálculo, manipulação do DOM e injeção de dados.

### Design & UX
- **Design System Próprio:** Interface escura focada em dados (Dashboard-like).
- **Feedback Visual:** Tooltips interativos e indicadores de cores (Verde/Vermelho) para status da negociação.
- **Responsividade:** Totalmente adaptável para Mobile e Desktop.

---

## 📄 Licença e Direitos Autorais

Copyright © 2026 **João Gonçalo**. Todos os direitos reservados.

<div align="center">
  <img src="https://img.shields.io/badge/COPYRIGHT-ALL_RIGHTS_RESERVED-red?style=for-the-badge" alt="Copyright">
</div>

> ⚠️ **Aviso Legal:** Este software é proprietário. É **estritamente proibida** a cópia, reprodução, distribuição ou uso deste código-fonte, total ou parcial, para fins comerciais ou públicos sem a autorização expressa e por escrito do autor. Este projeto é destinado exclusivamente para uso pessoal no contexto da liga Draence.

---

<div align="center">

**Desenvolvido com 🧠 estratégia e código.**

</div>