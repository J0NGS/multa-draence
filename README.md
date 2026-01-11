# ⚽ Draence Calculator

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Version](https://img.shields.io/badge/Version-4.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

**Simulador Estratégico de Multas Rescisórias e Contratos para o RPG Draence**

[Acessar Calculadora Online](https://j0ngs.github.io/multa-draence/) •
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

## ✨ Funcionalidades

### 💰 Calculadora Principal (`index.html`)
- **Cálculo Inteligente de Multas:** Baseado em VTC, reputação e perfil psicológico do jogador
- **4 Perfis Psicológicos:** Padrão, Mercenário, Fiel e Ambicioso com comportamentos únicos
- **Visualização em 2 Moedas:** BRL (Real Draence) e EUR (Euro) em tempo real
- **Dashboard Analítico:** Composição visual da multa em blocos (Base, K, Salário, Luvas, Reputação)
- **Validação de Déficit:** Alerta visual quando a oferta está abaixo do mercado
- **Input Masking Avançado:** Formatação automática de valores monetários com preservação de cursor
- **Responsividade Total:** Otimizado para desktop, tablet e mobile
- **Admin View:** Interface alternativa para análises avançadas com campos ocultos

### 📝 Montador de Propostas (`proposta.html`)
- **Geração Automática de Textos:** Cria propostas formatadas prontas para WhatsApp
- **Listas Dinâmicas:** Adicione premiações e cláusulas customizadas
- **Pré-preenchimento por URL:** Parâmetros GET permitem reutilizar cálculos
- **Botão Fixo Inteligente:** Acompanha o scroll e respeita o footer
- **Preview em Tempo Real:** Visualize a proposta conforme edita
- **Status Visual de Validação:** Indicadores de campos preenchidos

### 📚 Guia "Como Funciona" (`como-funciona.html`)
- **Jornada do Usuário Prática:** 4 passos simples (Dados → Contrato → Multa → Proposta)
- **Design Didático:** Cards numerados com emojis e exemplos concretos
- **Curiosidades:** Seção "Bastidores" explicando a mágica do cálculo
- **Totalmente Responsivo:** Adapta-se a todas as telas

### 🎨 UI/UX Melhorada (v4.0.0)
- **Logo Responsiva:** Adapta tamanho automaticamente (desktop → mobile)
- **Espaçamento Inteligente:** Cards separados com padding e bordas visuais
- **Botões Centralizados:** Todos os botões com layout flexbox perfeito
- **Sem Cadeados Visuais:** Campos readonly com estilo limpo
- **Layout Fluido:** Containers ajustam-se perfeitamente sem sobreposições

### 🛡️ Validação & Segurança
- **Limites de Input:** Min/Max em valores monetários e numéricos
- **Formatação Automática:** Pontos e virgulas em valores grandes
- **Proteção contra Déficit:** Penalidades automáticas

### 📊 Análises Avançadas (Admin)
- **Tabela de Valores Oficiais:** Consulte preços de mercado por posição/idade/overall
- **Perfis Comparativos:** Veja como cada arquétipo afeta a multa

---

## 👨‍💻 Desenvolvedor

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
├── index.html            # Dashboard principal (Calculadora)
├── admin.html            # View admin com campos avançados
├── proposta.html         # Montador de propostas automáticas
├── como-funciona.html    # Guia prático (Jornada do usuário)
├── tabela-valores.html   # Tabela de preços oficiais
├── style.css             # Estilos globais + responsividade
├── script.js             # Core lógico (v4.0.0)
├── dados_inline.js       # Base de dados (Mock)
└── Pes_drae.png          # Logo Draence
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