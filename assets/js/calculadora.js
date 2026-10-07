/**
 * ============================================
 * DRAENCE CALCULATOR v4.0.0
 * ============================================
 * 
 * Simulador Estratégico de Multas Rescisórias
 * Sistema de Negociação Avançado para RPG Draence
 * 
 * Autor: João Gonçalo (J0NGS)
 * Data: Janeiro 2026
 * 
 * Funcionalidades:
 * ✓ Cálculo inteligente de VTC
 * ✓ 4 Perfis psicológicos dinâmicos
 * ✓ Detecção automática de déficit
 * ✓ Montador de propostas automáticas
 * ✓ Validação e formatação de inputs
 * ✓ Interface totalmente responsiva
 * ✓ Análises comparativas avançadas
 * 
 * ============================================
 */

// Taxa de conversão BRL para EUR (derivada dos valores na base de dados)
const TAXA_BRL_EUR = 96049800 / 576298800; // ~0.1667

// ============================================
// FUNÇÕES UTILITÁRIAS DE MOEDA
// ============================================

/**
 * Converte string de valor monetário formatado para float numérico
 * Ex: "1.200.000" -> 1200000
 */
function parseMoney(valorString) {
    if (!valorString) return 0;
    if (typeof valorString === 'number') return valorString;
    
    // Remove todos os pontos (separadores de milhar)
    const valorLimpo = String(valorString).replace(/\./g, '');
    const numero = parseFloat(valorLimpo);
    
    return isNaN(numero) ? 0 : numero;
}

/**
 * Formata número com pontos como separadores de milhar
 * Ex: 1200000 -> "1.200.000"
 */
function formatMoneyDisplay(valor) {
    if (!valor || isNaN(valor)) return '';
    
    const numero = Math.floor(valor);
    return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Event listener para inputs de dinheiro
 * Formata visualmente e atualiza badge de magnitude
 */
function formatMoneyInput(event) {
    const input = event.target;
    
    // 1. Salvar posição do cursor e tamanho atual
    const cursorPosition = input.selectionStart;
    const originalLength = input.value.length;
    
    // 2. Limpar e Formatar
    let valorLimpo = input.value.replace(/\D/g, '');
    let valorFormatado = '';
    
    if (valorLimpo) {
        valorFormatado = parseInt(valorLimpo).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    // 3. Atualizar o input
    input.value = valorFormatado;
    
    // 4. Restaurar posição do cursor (Lógica inteligente)
    const newLength = input.value.length;
    let newCursorPosition = cursorPosition + (newLength - originalLength);
    
    // Correção para casos de deleção ou inserção de ponto
    if (newCursorPosition < 0) newCursorPosition = 0;
    if (newCursorPosition > newLength) newCursorPosition = newLength;
    
    // Define a nova posição
    input.setSelectionRange(newCursorPosition, newCursorPosition);

    // 5. Atualizar Badge (Lógica existente)
    const wrapper = input.parentElement;
    const badge = wrapper.querySelector('.magnitude-badge');
    if (badge) {
        const num = parseMoney(valorFormatado);
        badge.className = 'magnitude-badge';
        if (num >= 1000000) { 
            badge.textContent = 'M'; 
            badge.classList.add('magnitude-M'); 
        }
        else if (num >= 1000) { 
            badge.textContent = 'm'; 
            badge.classList.add('magnitude-m'); 
        }
        else { 
            badge.textContent = ''; 
        }
    }
}

/**
 * Valida limites de valor para inputs (numéricos e monetários)
 * Executa no evento 'blur' (quando usuário sai do campo)
 * Força o valor para o mínimo ou máximo se ultrapassado
 */
function enforceLimits(event) {
    const input = event.target;
    
    // Identificar se é input monetário ou numérico
    const isMoneyInput = input.classList.contains('input-money');
    
    // Obter o valor atual
    let valorAtual;
    if (isMoneyInput) {
        valorAtual = parseMoney(input.value);
    } else {
        valorAtual = Number(input.value);
    }
    
    // Obter limites (de atributos HTML ou data-attributes)
    const min = Number(input.dataset.min !== undefined ? input.dataset.min : input.min) || 0;
    const max = Number(input.dataset.max !== undefined ? input.dataset.max : input.max) || 999999999;
    
    // Validar e corrigir se necessário
    let valorCorrigido = valorAtual;
    if (valorAtual < min) {
        valorCorrigido = min;
    } else if (valorAtual > max) {
        valorCorrigido = max;
    }
    
    // Se houve alteração, atualizar o input
    if (valorCorrigido !== valorAtual) {
        if (isMoneyInput) {
            // Para inputs monetários, formatar com pontos
            const valorFormatado = formatMoneyDisplay(valorCorrigido);
            input.value = valorFormatado;
            
            // Atualizar badge de magnitude
            const badge = input.parentElement.querySelector('.magnitude-badge');
            if (badge) {
                badge.className = 'magnitude-badge';
                if (valorCorrigido >= 1000000) { 
                    badge.textContent = 'M'; 
                    badge.classList.add('magnitude-M'); 
                }
                else if (valorCorrigido >= 1000) { 
                    badge.textContent = 'm'; 
                    badge.classList.add('magnitude-m'); 
                }
                else { 
                    badge.textContent = ''; 
                }
            }
        } else {
            // Para inputs numéricos, apenas atualizar o valor
            input.value = valorCorrigido;
        }
        
        // Adicionar feedback visual de correção
        input.classList.add('input-corrected');
        setTimeout(() => {
            input.classList.remove('input-corrected');
        }, 1000);
    }
}

// ============================================
// CONSTANTES DE PERFIS
// ============================================

const PERFIS = {
    padrao: { sal: 0.1, luv: 0.04, k_factor: 0.5, label: "Padrão" },
    mercenario: {sal: 0.1, luv: 0.15, k_factor: 0.35, label: "Mercenário" },
    fiel: { sal: 0.35, luv: 0.05, k_factor: 0.9, label: "Fiel" },
    ambicioso: { sal: 0.25, luv: 0.07, k_factor: 0.25, label: "Ambicioso" }
};

const MAX_PESO_SAL = 0.35;
const MAX_PESO_LUV = 0.12;

// ============================================
// PERFIS DE INFLUÊNCIAS EXTERNAS
// ============================================

const PERFIS_INFLUENCIA = {
    critica: { valor: -0.15, label: "Crítica (Péssimo)", descricao: "Péssimo" },
    severa: { valor: -0.10, label: "Severa (Muito Ruim)", descricao: "Muito Ruim" },
    moderada: { valor: -0.05, label: "Moderada (Ruim)", descricao: "Ruim" },
    leve: { valor: 0.05, label: "Leve (Positiva)", descricao: "Positiva" },
    positiva: { valor: 0.10, label: "Positiva (Bom)", descricao: "Bom" },
    excelente: { valor: 0.15, label: "Excelente (Muito Bom)", descricao: "Muito Bom" }
};

// ============================================
// CONTROLE DE INFLUÊNCIAS
// ============================================

let influenciasExternas = [];
let contadorInfluencias = 0;

function adicionarInfluencia() {
    contadorInfluencias++;
    influenciasExternas.push({
        id: contadorInfluencias,
        label: "",
        perfil: "",
        valor: 0
    });
    renderizarInfluencias();
}

function removerInfluencia(id) {
    influenciasExternas = influenciasExternas.filter(i => i.id !== id);
    renderizarInfluencias();
}

function renderizarInfluencias() {
    const container = document.getElementById('influenciasContainer');
    
    if (!container) return; // Protege em visualizações que não têm o container
    
    if (influenciasExternas.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = influenciasExternas.map((inf) => {
        const perfis = Object.entries(PERFIS_INFLUENCIA).map(([key, data]) => 
            `<option value="${key}" ${inf.perfil === key ? 'selected' : ''}>${data.label}</option>`
        ).join('');
        
        return `
        <div class="influencia-item">
            <input type="text" class="influencia-input-nome" placeholder="Ex: Lesão" value="${inf.label}" 
                   onchange="atualizarInfluencia(${inf.id}, 'label', this.value)">
            <select class="influencia-input-valor" onchange="atualizarInfluencia(${inf.id}, 'perfil', this.value)">
                <option value="">-- Selecione --</option>
                ${perfis}
            </select>
            <button type="button" class="btn-remove-influencia" onclick="removerInfluencia(${inf.id})" title="Remover">
                ✕
            </button>
        </div>
    `;
    }).join('');
}

function atualizarInfluencia(id, campo, valor) {
    const inf = influenciasExternas.find(i => i.id === id);
    if (inf) {
        if (campo === 'perfil') {
            inf.perfil = valor;
            inf.valor = PERFIS_INFLUENCIA[valor]?.valor || 0;
        } else {
            inf[campo] = valor;
        }
    }
}

// ============================================
// CAMPO DE SATISFAÇÃO DO JOGADOR
// ============================================
// Satisfação será capturada dinamicamente em calcularMulta()
// Modelo conservador: (satisfacao - 50) / fatorSatisfacao
// Default (fatorSatisfacao=500): intervalo de -0.10 a +0.10 (±10%)
// Editável no admin, fixo no index

// ============================================
// CONTROLE DE AUTO-FILL
// ============================================

const selectPosicao = document.getElementById('posicao');
const inputIdade = document.getElementById('idade');
const inputOverall = document.getElementById('overall');
const inputSalario = document.getElementById('salarioOferecido');
const inputLuvas = document.getElementById('luvasOferecidas');
const inputAnosContrato = document.getElementById('anosContrato');

function preencherSalariosLuvas() {
    if (!selectPosicao) return;
    
    const posicao = selectPosicao.value;
    const idade = parseInt(inputIdade.value);
    const overall = parseInt(inputOverall.value);

    if (!posicao || !idade || !overall) return;

    const dadosBase = buscarDadosBaseSalarial(overall);
    if (dadosBase) {
        inputSalario.value = dadosBase.salario_base;
        inputLuvas.value = dadosBase.luvas_base;
        
        // Formatar os valores que foram carregados
        const eventSalario = { target: inputSalario };
        formatMoneyInput(eventSalario);
        
        const eventLuvas = { target: inputLuvas };
        formatMoneyInput(eventLuvas);
        
        // Atualizar valor das luvas multiplicado pelos anos
        atualizarValorLuvas();
    }
}

// ============================================
// ATUALIZAR VALOR DAS LUVAS DINAMICAMENTE
// ============================================

function atualizarValorLuvas() {
    if (!inputLuvas || !inputAnosContrato) return;
    
    const anos = parseInt(inputAnosContrato.value) || 1;
    const overall = parseInt(inputOverall.value);
    
    if (!overall || !inputLuvas.value) {
        return;
    }
    
    // Pegar o valor base das luvas (valor atual dividido pelo número de anos anterior)
    // Se o usuário já tem um valor, precisamos atualizar baseado nos anos
    const dadosBase = buscarDadosBaseSalarial(overall);
    
    if (dadosBase) {
        // Luva base por ano * quantidade de anos
        const novoValorLuvas = Math.floor(dadosBase.luvas_base * anos);
        
        // Atualizar o valor do input
        inputLuvas.value = novoValorLuvas;
        
        // Formatar visualmente
        const event = { target: inputLuvas };
        formatMoneyInput(event);
    }
}

if (selectPosicao) {
    selectPosicao.addEventListener('change', preencherSalariosLuvas);
}
if (inputIdade) {
    inputIdade.addEventListener('change', preencherSalariosLuvas);
}
if (inputOverall) {
    inputOverall.addEventListener('change', preencherSalariosLuvas);
}
if (inputAnosContrato) {
    inputAnosContrato.addEventListener('change', atualizarValorLuvas);
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function formatarBRL(valor) {
    if (!valor || isNaN(valor)) return '£D 0';
    const numero = Math.floor(valor);
    return '£D ' + numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatarEUR(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
}

function formatarDecimal(valor, casas = 2) {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}

function formatarSemMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function calcularPercentual(oferecido, base) {
    if (base === 0) return 0;
    return ((oferecido - base) / base) * 100;
}

function atualizarBadgePercentual(valueElementId, containerElementId, badgeId, oferecido, base) {
    const percentual = calcularPercentual(oferecido, base);
    const valueElement = document.getElementById(valueElementId);
    const containerElement = document.getElementById(containerElementId);
    const badge = document.getElementById(badgeId);
    
    if (!valueElement || !containerElement || !badge) return;
    
    // Atualizar valor
    valueElement.textContent = formatarBRL(oferecido);
    
    // Remover classes anteriores
    containerElement.classList.remove('aumentou', 'diminuiu');
    badge.classList.remove('aumentou', 'diminuiu');
    
    // Aplicar novas classes e textos
    if (percentual > 0) {
        containerElement.classList.add('aumentou');
        badge.classList.add('aumentou');
        badge.textContent = `+${percentual.toFixed(1)}%`;
    } else if (percentual < 0) {
        containerElement.classList.add('diminuiu');
        badge.classList.add('diminuiu');
        badge.textContent = `${percentual.toFixed(1)}%`;
    } else {
        badge.textContent = '0%';
    }
}

function buscarValorMercado(posicao, idade, overall) {
    const registro = DB_MERCADO.find(r => 
        r.posicao === posicao && 
        r.idade === idade && 
        r.overall === overall
    );
    return registro ? registro.valor_brl : null;
}

function buscarDadosBaseSalarial(overall) {
    let registro = DB_SALARIO.find(r => r.overall === overall);
    
    if (!registro && typeof overall === 'number') {
        const menores = DB_SALARIO.filter(r => typeof r.overall === 'number' && r.overall <= overall);
        if (menores.length > 0) {
            registro = menores[menores.length - 1];
        }
    }

    return registro ? {
        salario_base: registro.salario_base,
        luvas_base: registro.luvas_base
    } : null;
}

function mostrarErro(mensagem) {
    const erroDiv = document.getElementById('erro');
    erroDiv.textContent = mensagem;
    erroDiv.classList.add('show');
    document.getElementById('resultado').classList.remove('show');
}

function limparErro() {
    document.getElementById('erro').classList.remove('show');
}

// ============================================
// FUNÇÕES DE AJUSTE (BOTÕES +/-)
// ============================================

/**
 * Ajusta um valor de entrada monetária seguindo o padrão de arredondamento
 * Acima de 1M: incrementa/decrementa 100 mil
 * Abaixo de 1M: incrementa/decrementa 1 mil
 */
function ajustarValorMonetario(inputId, incrementar = true) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const valorAtual = parseMoney(input.value) || 0;
    
    // Determinar o incremento baseado no valor
    let incremento;
    if (valorAtual >= 1000000) {
        incremento = 100000; // 100 mil
    } else {
        incremento = 1000; // 1 mil
    }
    
    // Calcular novo valor
    let novoValor = incrementar ? valorAtual + incremento : valorAtual - incremento;
    
    // Obter limites
    const min = Number(input.dataset.min || input.min) || 0;
    const max = Number(input.dataset.max || input.max) || 999999999;
    
    // Aplicar limites
    if (novoValor < min) novoValor = min;
    if (novoValor > max) novoValor = max;
    
    // Atualizar o input com o novo valor formatado
    const valorFormatado = formatMoneyDisplay(novoValor);
    input.value = valorFormatado;
    
    // Trigger evento de mudança para atualizar a interface
    const event = new Event('blur', { bubbles: true });
    input.dispatchEvent(event);
    
    // Calcular automaticamente
    calcularMulta();
}

// ============================================
// CÁLCULO PRINCIPAL
// ============================================

function calcularMulta() {
    document.getElementById('erro').classList.remove('show');

    // 1. CAPTURA DE DADOS COM FALLBACKS PARA VISÃO USUÁRIO
    const posicao = document.getElementById('posicao').value;
    const idade = parseInt(document.getElementById('idade').value);
    const overall = parseInt(document.getElementById('overall').value);
    const inputAnos = document.getElementById('anosContrato');
    const anosContrato = inputAnos ? parseInt(inputAnos.value) : 1; 
    
    // FALLBACKS: Se elementos não existem (visão usuário), usar valores padrão
    const kBaseElement = document.getElementById('kBase');
    const kBase = kBaseElement ? parseFloat(kBaseElement.value) : 1.1;
    
    const salarioOferecido = parseMoney(document.getElementById('salarioOferecido').value);
    const luvasOferecidas = parseMoney(document.getElementById('luvasOferecidas').value);
    
    // NOVO: Captura de Satisfação do Jogador (Modelo Conservador)
    const satisfacaoElement = document.getElementById('satisfacao');
    const satisfacao = satisfacaoElement ? parseInt(satisfacaoElement.value) : 50;

    if (!posicao || !idade || !overall) return mostrarErro('Preencha os dados obrigatórios.');

    // 2. BUSCA DE BASES
    const valorMercado = buscarValorMercado(posicao, idade, overall);
    if (!valorMercado) return mostrarErro('Combinação de mercado não encontrada.');

    const dadosBase = buscarDadosBaseSalarial(overall);
    if (!dadosBase) return mostrarErro('Dados salariais não encontrados.');

    // 3. CÁLCULO DO PACOTE FINANCEIRO TOTAL (VTC)
    // Base: (Salário Mensal * 12 * Anos) + (Luva Base Anual * Anos)
    const vtcBase = (dadosBase.salario_base * 12 * anosContrato) + (dadosBase.luvas_base * anosContrato);
    
    // Oferta: (Salário Mensal Oferecido * 12 * Anos) + Luva Oferecida Total
    const vtcOferecido = (salarioOferecido * 12 * anosContrato) + luvasOferecidas;

    // Delta Global (Diferença percentual do pacote total)
    const deltaGlobal = (vtcOferecido - vtcBase) / vtcBase;

    // 4. CÁLCULO DA SATISFAÇÃO (Modelo Conservador)
    // Fórmula: (Satisfação - 50) / fatorSatisfacao
    // Default (500): 50 -> 0.00 (Neutro), 100 -> +0.10 (Máximo bônus), 0 -> -0.10 (Máxima penalidade)
    // Admin pode editar o fator (divisor) para aumentar/diminuir impacto
    const fatorSatisfacaoElement = document.getElementById('fatorSatisfacao');
    const fatorSatisfacao = fatorSatisfacaoElement ? parseFloat(fatorSatisfacaoElement.value) : 500;
    const detalheSat = (satisfacao - 50) / fatorSatisfacao;

    // 5. LÓGICA DE MULTIPLICADOR (DUPLO: Máxima e Sugerida)
    let multiplicadorMax = 0;
    let multiplicadorSug = 0;
    
    // Variáveis para detalhamento visual
    let detalheK = 0, detalheSal = 0, detalheLuv = 0;
    
    // Influências Externas
    // Em cenário de DÉFICIT, apenas influências negativas são consideradas
    // Em cenário de SUPERÁVIT, todas as influências são consideradas
    let epsilon = influenciasExternas
        .filter(inf => {
            // Se houver déficit, só considerar influências negativas
            if (deltaGlobal < 0) {
                return inf.valor < 0;
            }
            // Se não houver déficit, considerar todas
            return true;
        })
        .reduce((acc, curr) => acc + curr.valor, 0);

    // Pesos Fixos da Máxima (Teto)
    const MAX_PESO_SAL = 0.5;
    const MAX_PESO_LUV = 0.2;

    // Pesos do Perfil (Sugerida)
    const perfilSelect = document.getElementById('perfilJogador');
    const perfilKey = perfilSelect ? perfilSelect.value : 'padrao';
    const perfilDados = PERFIS[perfilKey] || PERFIS['padrao'];

    if (deltaGlobal < 0) {
        // --- DÉFICIT ---
        // Max: Penaliza direto (penalidade completa)
        multiplicadorMax = 1.0 + deltaGlobal + epsilon;
        
        // Sugerida: Redução de penalidade baseada no k_factor do perfil
        // k_factor 0.95 (Fiel): reduz apenas 5% da penalidade
        // k_factor 0.60 (Ambicioso): reduz 40% da penalidade
        const fatorReducaoDeficit = 1 - perfilDados.k_factor;
        multiplicadorSug = multiplicadorMax + (deltaGlobal * fatorReducaoDeficit);
        
        // Trava mínima
        if (multiplicadorMax < 0.1) multiplicadorMax = 0.1;
        if (multiplicadorSug < 0.1) multiplicadorSug = 0.1;

        // Ajustes para o detalhamento
        detalheK = 1.0; 
        detalheSal = deltaGlobal * (2 - perfilDados.k_factor);

    } else {
        // --- SUPERÁVIT / NEUTRO ---
        
        // 1. Definição do K (Base)
        // Max usa o K cheio digitado. Sugerida usa uma fração baseada no perfil.
        // Ex: Se K=1.2 (lucro 0.2), perfil 0.8 aceita lucro de 0.16 -> K=1.16
        const kSugCalculado = 1 + ((kBase - 1) * perfilDados.k_factor);

        multiplicadorMax = kBase;
        multiplicadorSug = kSugCalculado;
        detalheK = kBase;

        // 2. NOVO: Satisfação do Jogador (Modelo Conservador)
        // Aplicada igual para Max e Sug
        multiplicadorMax += detalheSat;
        multiplicadorSug += detalheSat;

        // 3. Deltas Financeiros
        // Salário
        let deltaSalarioMax = 0;
        let deltaSalarioSug = 0;
        if (dadosBase.salario_base > 0) {
            const propSal = (salarioOferecido - dadosBase.salario_base) / dadosBase.salario_base;
            deltaSalarioMax = propSal * MAX_PESO_SAL;
            deltaSalarioSug = propSal * perfilDados.sal;
        }
        multiplicadorMax += deltaSalarioMax;
        multiplicadorSug += deltaSalarioSug;
        detalheSal = deltaSalarioMax;

        // Luvas (Comparando com Total)
        const luvaBaseTotalPeriodo = dadosBase.luvas_base * anosContrato;
        let deltaLuvasMax = 0;
        let deltaLuvasSug = 0;
        if (luvaBaseTotalPeriodo > 0) {
            const propLuv = (luvasOferecidas - luvaBaseTotalPeriodo) / luvaBaseTotalPeriodo;
            deltaLuvasMax = propLuv * MAX_PESO_LUV;
            deltaLuvasSug = propLuv * perfilDados.luv;
        }
        multiplicadorMax += deltaLuvasMax;
        multiplicadorSug += deltaLuvasSug;
        detalheLuv = deltaLuvasMax;

        // 4. Influências (Igual para ambos)
        multiplicadorMax += epsilon;
        multiplicadorSug += epsilon;
    }

    // 6. RENDERIZAÇÃO DOS RESULTADOS
    let multaSugeridaFinal = valorMercado * multiplicadorSug;
    let multaMaximaFinal = valorMercado * multiplicadorMax;
    
    // Arredondar para valores fechados: 
    // Acima de 1M: arredondar para 100 mil em 100 mil
    // Abaixo de 1M: arredondar para 1 mil em 1 mil
    const arredondarMulta = (valor) => {
        if (valor >= 1000000) {
            return Math.round(valor / 100000) * 100000;
        } else {
            return Math.round(valor / 1000) * 1000;
        }
    };
    
    multaSugeridaFinal = arredondarMulta(multaSugeridaFinal);
    multaMaximaFinal = arredondarMulta(multaMaximaFinal);
    
    // Converter para Euro e depois arredondar
    let multaSugeridaEuro = multaSugeridaFinal * TAXA_BRL_EUR;
    let multaMaximaEuro = multaMaximaFinal * TAXA_BRL_EUR;
    
    multaSugeridaEuro = arredondarMulta(multaSugeridaEuro);
    multaMaximaEuro = arredondarMulta(multaMaximaEuro);

    // NOVO LAYOUT - SCOREBOARD
    document.getElementById('multaSugBRL').textContent = formatarBRL(multaSugeridaFinal);
    document.getElementById('multaSugEUR').textContent = formatarEUR(multaSugeridaEuro);
    
    // Verificar se elemento de teto máximo existe (visão admin)
    const multaMaxBRLElement = document.getElementById('multaMaxBRL');
    if (multaMaxBRLElement) {
        multaMaxBRLElement.textContent = formatarBRL(multaMaximaFinal);
    }
    
    const multaMaxEURElement = document.getElementById('multaMaxEUR');
    if (multaMaxEURElement) {
        multaMaxEURElement.textContent = formatarEUR(multaMaximaEuro);
    }
    
    const labelPerfilElement = document.getElementById('labelPerfil');
    if (labelPerfilElement) labelPerfilElement.textContent = perfilDados.label;

    // Adicionar badges de percentagem para as multas
    const percentMultaSug = calcularPercentual(multaSugeridaFinal, valorMercado);
    const percentMultaMax = calcularPercentual(multaMaximaFinal, valorMercado);
    
    const badgeMultaSug = document.getElementById('percentMultaSug');
    if (badgeMultaSug) {
        badgeMultaSug.textContent = (percentMultaSug >= 0 ? '+' : '') + percentMultaSug.toFixed(1) + '%';
        badgeMultaSug.classList.remove('aumentou', 'diminuiu');
        if (percentMultaSug > 0) {
            badgeMultaSug.classList.add('aumentou');
        } else if (percentMultaSug < 0) {
            badgeMultaSug.classList.add('diminuiu');
        }
    }

    const badgeMultaMaxElement = document.getElementById('percentMultaMax');
    if (badgeMultaMaxElement) {
        badgeMultaMaxElement.textContent = (percentMultaMax >= 0 ? '+' : '') + percentMultaMax.toFixed(1) + '%';
        badgeMultaMaxElement.classList.remove('aumentou', 'diminuiu');
        if (percentMultaMax > 0) {
            badgeMultaMaxElement.classList.add('aumentou');
        } else if (percentMultaMax < 0) {
            badgeMultaMaxElement.classList.add('diminuiu');
        }
    }

    // NOVO LAYOUT - MATH VISUAL (apenas se existir container)
    const mathVisualizationContainer = document.querySelector('.math-visual-container');
    if (mathVisualizationContainer) {
        document.getElementById('mathK').textContent = deltaGlobal < 0 ? "1.00" : formatarDecimal(kBase, 2);
        document.getElementById('mathRep').textContent = (detalheSat >= 0 ? '+' : '') + formatarDecimal(detalheSat, 4);
        document.getElementById('mathSal').textContent = (detalheSal >= 0 ? '+' : '') + formatarDecimal(detalheSal, 4);
        document.getElementById('mathLuv').textContent = (detalheLuv >= 0 ? '+' : '') + formatarDecimal(detalheLuv, 4);
        document.getElementById('mathEps').textContent = (epsilon >= 0 ? '+' : '') + formatarDecimal(epsilon, 4);
        document.getElementById('mathTotal').textContent = formatarDecimal(multiplicadorSug, 4) + 'x';
    
        // Math explanation
        let explanation = '';
        if (deltaGlobal < 0) {
            explanation = `Cenário de DÉFICIT: ${formatarDecimal(deltaGlobal*100, 1)}% abaixo do VTC Base. Multiplicador reduzido conforme o perfil.`;
        } else if (deltaGlobal > 0) {
            explanation = `Cenário de SUPERÁVIT: ${formatarDecimal(deltaGlobal*100, 1)}% acima do VTC Base. Multiplicador composto por todos os fatores.`;
        } else {
            explanation = `Cenário NEUTRO: VTC oferecido igual ao VTC Base.`;
        }
        const mathExplEl = document.getElementById('mathExplanation');
        if (mathExplEl) mathExplEl.textContent = explanation;
    }

    // ===== INJEÇÃO DE TOOLTIPS DIDÁTICOS (MATH-STEPS) =====
    
    // 1. K Base
    let kText = "";
    if (deltaGlobal < 0) {
        kText = "Anulado devido ao Déficit Financeiro. O sistema travou a base em 1.0x (Valor de Mercado).";
    } else {
        kText = `Sua pedida inicial foi ${formatarDecimal(kBase, 2)}. O perfil '${perfilDados.label}' aceitou ${formatarDecimal(perfilDados.k_factor * 100, 0)}% disso.`;
    }
    const stepKBaseEl = document.getElementById('stepKBase');
    if (stepKBaseEl) stepKBaseEl.dataset.tooltip = kText;
    // 2. Satisfação do Jogador (NOVO - Modelo Conservador)
    let satText = `Satisfação de ${satisfacao} gerou um ajuste conservador de ${detalheSat > 0 ? '+' : ''}${formatarDecimal(detalheSat, 4)} na multa. (Intervalo: -0.10 a +0.10)`;
    const stepRepEl = document.getElementById('stepRep');
    if (stepRepEl) stepRepEl.dataset.tooltip = satText;

    // 3. Salário
    let salText = "";
    if (deltaGlobal < 0) {
        salText = `PENALIDADE: Sua oferta total está ${formatarDecimal(deltaGlobal*100, 1)}% abaixo do mínimo exigido pelo jogador.`;
    } else {
        const aumentoSal = dadosBase.salario_base > 0 ? ((salarioOferecido - dadosBase.salario_base) / dadosBase.salario_base) * 100 : 0;
        salText = `Você ofereceu +${formatarDecimal(aumentoSal, 1)}% de salário. O perfil '${perfilDados.label}' converteu isso com peso ${formatarDecimal(perfilDados.sal, 2)}.`;
    }
    const stepSalEl = document.getElementById('stepSal');
    if (stepSalEl) stepSalEl.dataset.tooltip = salText;

    // 4. Luvas
    let luvText = "";
    if (deltaGlobal < 0) {
        luvText = "Impacto das luvas anulado pelo Déficit Global.";
    } else {
        const luvaBaseTotalPeriodo = dadosBase.luvas_base * anosContrato;
        const aumentoLuv = (luvaBaseTotalPeriodo > 0) ? ((luvasOferecidas - luvaBaseTotalPeriodo) / luvaBaseTotalPeriodo) * 100 : 0;
        luvText = `Comparado ao custo total (${anosContrato} anos), sua luva variou ${formatarDecimal(aumentoLuv, 1)}%. Peso aplicado: ${formatarDecimal(perfilDados.luv, 2)}.`;
    }
    const stepLuvEl = document.getElementById('stepLuv');
    if (stepLuvEl) stepLuvEl.dataset.tooltip = luvText;

    // 5. Extras
    const stepEpsEl = document.getElementById('stepEps');
    if (stepEpsEl) stepEpsEl.dataset.tooltip = 
        `Soma de ${influenciasExternas.length} fatores externos manuais.`;


    // Grid de detalhes (mantém os elementos para referência)
    const valorMercadoEl = document.getElementById('valorMercado');
    if (valorMercadoEl) valorMercadoEl.textContent = formatarBRL(valorMercado);
    
    const dadosJogadorEl = document.getElementById('dadosJogador');
    if (dadosJogadorEl) dadosJogadorEl.textContent = `${posicao} • ${idade}a • OVR ${overall}`;
    
    const salarioBaseEl = document.getElementById('salarioBase');
    if (salarioBaseEl) salarioBaseEl.textContent = formatarBRL(dadosBase.salario_base);
    
    const luvasBaseEl = document.getElementById('luvasBase');
    if (luvasBaseEl) luvasBaseEl.textContent = formatarBRL(dadosBase.luvas_base * anosContrato);

    atualizarBadgePercentual('salarioOferecidoValue', 'salarioOferecidoShow', 'percentSalario', salarioOferecido, dadosBase.salario_base);
    atualizarBadgePercentual('luvasOferecidasValue', 'luvasOferecidasShow', 'percentLuvas', luvasOferecidas, (dadosBase.luvas_base * anosContrato));

    const vtcBaseEl = document.getElementById('vtcBase');
    if (vtcBaseEl) vtcBaseEl.textContent = formatarBRL(vtcBase);
    atualizarBadgePercentual('vtcOferecidoValue', 'vtcOferecidoShow', 'percentVTC', vtcOferecido, vtcBase);

    // Mostrar resultado
    const resultadoEl = document.getElementById('resultado');
    if (resultadoEl) resultadoEl.classList.add('show');
}

// ============================================
// ATUALIZAR DESCRIÇÃO DA MULTA BASE DINAMICAMENTE
// ============================================

function atualizarDescricaoKBase() {
    const kBaseInput = document.getElementById('kBase');
    const helpText = document.getElementById('helpTextKBase');
    
    if (!kBaseInput || !helpText) return;
    
    const kValue = parseFloat(kBaseInput.value);
    const percentual = ((kValue - 1) * 100).toFixed(1);
    helpText.textContent = `Multiplicador de ${percentual}% acima do valor`;
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Draence Calculator v4.0.0 iniciado - Sistema de Negociação Avançado');

    // Popula posições (se elemento existe)
    if (selectPosicao) {
        const posicoes = [...new Set(DB_MERCADO.map(r => r.posicao))].sort();
        posicoes.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            selectPosicao.appendChild(option);
        });
    }

    // Formulário
    const form = document.getElementById('formCalculo');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            calcularMulta();
        });

        form.addEventListener('reset', () => {
        document.getElementById('resultado').classList.remove('show');
        limparErro();
        influenciasExternas = [];
        contadorInfluencias = 0;
        renderizarInfluencias();
        
        // Elementos que podem não existir em index.html (visão usuário)
        const satisfacaoEl = document.getElementById('satisfacao');
        if (satisfacaoEl) satisfacaoEl.value = 50;
        
        const fatorSatisfacaoEl = document.getElementById('fatorSatisfacao');
        if (fatorSatisfacaoEl) fatorSatisfacaoEl.value = 500;
        
        const kBaseEl = document.getElementById('kBase');
        if (kBaseEl) kBaseEl.value = 1.2;
        
        const anosContratoEl = document.getElementById('anosContrato');
        if (anosContratoEl) anosContratoEl.value = 3;
        
        document.getElementById('salarioOferecido').value = '';
        document.getElementById('luvasOferecidas').value = '';
        if (selectPosicao) selectPosicao.value = '';
        document.getElementById('idade').value = '';
        document.getElementById('overall').value = '';
        document.getElementById('overall').value = '';
        });
    }

    // ============================================
    // INICIALIZAR FORMATAÇÃO DE INPUTS DE DINHEIRO
    // ============================================
    
    // Seleciona todos os inputs com classe 'input-money'
    const moneyInputs = document.querySelectorAll('.input-money');
    moneyInputs.forEach(input => {
        input.addEventListener('input', formatMoneyInput);
        input.addEventListener('blur', enforceLimits);
        
        // Formata valor padrão se existir
        if (input.value) {
            const event = { target: input };
            formatMoneyInput(event);
        }
    });

    // ============================================
    // INICIALIZAR VALIDAÇÃO DE INPUTS NUMÉRICOS
    // ============================================
    
    // Adicionar listener 'blur' para campos numéricos com limites
    const numericInputs = ['idade', 'overall', 'anosContrato', 'satisfacao', 'fatorSatisfacao', 'kBase'];
    numericInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('blur', enforceLimits);
        }
    });

    // ============================================
    // INICIALIZAR BOTÕES DE AJUSTE (+/-)
    // ============================================
    
    // Botões para Salário
    const btnSalarioMais = document.getElementById('btnSalarioMais');
    const btnSalarioMenos = document.getElementById('btnSalarioMenos');
    if (btnSalarioMais) {
        btnSalarioMais.addEventListener('click', (e) => {
            e.preventDefault();
            ajustarValorMonetario('salarioOferecido', true);
        });
    }
    if (btnSalarioMenos) {
        btnSalarioMenos.addEventListener('click', (e) => {
            e.preventDefault();
            ajustarValorMonetario('salarioOferecido', false);
        });
    }
    
    // Botões para Luvas
    const btnLuvasMais = document.getElementById('btnLuvasMais');
    const btnLuvasMenos = document.getElementById('btnLuvasMenos');
    if (btnLuvasMais) {
        btnLuvasMais.addEventListener('click', (e) => {
            e.preventDefault();
            ajustarValorMonetario('luvasOferecidas', true);
        });
    }
    if (btnLuvasMenos) {
        btnLuvasMenos.addEventListener('click', (e) => {
            e.preventDefault();
            ajustarValorMonetario('luvasOferecidas', false);
        });
    }

    // Botão adicionar influência (se existe - apenas admin)
    const btnAdicionarInfluencia = document.getElementById('btnAdicionarInfluencia');
    if (btnAdicionarInfluencia) {
        btnAdicionarInfluencia.addEventListener('click', (e) => {
            e.preventDefault();
            adicionarInfluencia();
        });
    }

    // Event listener para atualizar descrição da multa base dinamicamente
    const kBaseInput = document.getElementById('kBase');
    if (kBaseInput) {
        kBaseInput.addEventListener('input', atualizarDescricaoKBase);
        // Chamar uma vez na inicialização
        atualizarDescricaoKBase();
    }

    // Inicializar com uma influência
    adicionarInfluencia();

    // ============================================
    // INTEGRAÇÃO COM MONTADOR DE PROPOSTAS
    // ============================================

    const btnIrParaProposta = document.getElementById('btnIrParaProposta');
    if (btnIrParaProposta) {
        btnIrParaProposta.addEventListener('click', () => {
            // Capturar valores atuais do formulário (usando parseMoney para inputs formatados)
            const salarioOferecido = parseMoney(document.getElementById('salarioOferecido').value) || 0;
            const luvasOferecidas = parseMoney(document.getElementById('luvasOferecidas').value) || 0;
            const anosContrato = parseInt(document.getElementById('anosContrato').value) || 1;
            
            // Obter valor da multa sugerida em £D (extrair apenas números do texto)
            const multaSugElement = document.getElementById('multaSugBRL');
            const multaSugTexto = multaSugElement.textContent.replace(/\D/g, '');
            const multaSugDraence = parseInt(multaSugTexto) || 0;

            // Converter multa sugerida para EUR (para Exterior)
            const multaSugEuro = Math.floor(multaSugDraence * TAXA_BRL_EUR);

            // Construir URL com parâmetros
            // - multa: multa sugerida em £D (Draence)
            // - multaExterior: multa sugerida em EUR (Exterior)
            const url = `proposta.html?salario=${encodeURIComponent(salarioOferecido)}&luvas=${encodeURIComponent(luvasOferecidas)}&anos=${encodeURIComponent(anosContrato)}&multa=${encodeURIComponent(multaSugDraence)}&multaExterior=${encodeURIComponent(multaSugEuro)}`;
            
            // Redirecionar
            window.location.href = url;
        });
    }
});
