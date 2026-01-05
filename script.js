// Taxa de conversão BRL para EUR (derivada dos valores na base de dados)
const TAXA_BRL_EUR = 96049800 / 576298800; // ~0.1667

// ============================================
// CONSTANTES DE PERFIS
// ============================================

const PERFIS = {
    padrao: { sal: 0.25, luv: 0.12, k_factor: 0.85, label: "Padrão" },
    mercenario: { sal: 0.20, luv: 0.08, k_factor: 0.90, label: "Mercenário" },
    fiel: { sal: 0.30, luv: 0.06, k_factor: 0.95, label: "Fiel" },
    ambicioso: { sal: 0.15, luv: 0.06, k_factor: 0.60, label: "Ambicioso" }
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
// CONTROLE DE REPUTAÇÃO
// ============================================

const checkboxDeltaRep = document.getElementById('usarDeltaReputacao');
const inputReputacaoTime = document.getElementById('reputacaoTime');
const inputReputacaoJogador = document.getElementById('reputacaoJogador');

checkboxDeltaRep.addEventListener('change', (e) => {
    const habilitado = e.target.checked;
    inputReputacaoTime.disabled = !habilitado;
    inputReputacaoJogador.disabled = !habilitado;
});

// ============================================
// CONTROLE DE AUTO-FILL
// ============================================

const selectPosicao = document.getElementById('posicao');
const inputIdade = document.getElementById('idade');
const inputOverall = document.getElementById('overall');
const inputSalario = document.getElementById('salarioOferecido');
const inputLuvas = document.getElementById('luvasOferecidas');

function preencherSalariosLuvas() {
    const posicao = selectPosicao.value;
    const idade = parseInt(inputIdade.value);
    const overall = parseInt(inputOverall.value);

    if (!posicao || !idade || !overall) return;

    const dadosBase = buscarDadosBaseSalarial(overall);
    if (dadosBase) {
        inputSalario.value = dadosBase.salario_base;
        inputLuvas.value = dadosBase.luvas_base;
    }
}

selectPosicao.addEventListener('change', preencherSalariosLuvas);
inputIdade.addEventListener('change', preencherSalariosLuvas);
inputOverall.addEventListener('change', preencherSalariosLuvas);

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function formatarBRL(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
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
// CÁLCULO PRINCIPAL
// ============================================

function calcularMulta() {
    document.getElementById('erro').classList.remove('show');

    // 1. CAPTURA DE DADOS
    const posicao = document.getElementById('posicao').value;
    const idade = parseInt(document.getElementById('idade').value);
    const overall = parseInt(document.getElementById('overall').value);
    const inputAnos = document.getElementById('anosContrato');
    const anosContrato = inputAnos ? parseInt(inputAnos.value) : 1; 
    
    const kBase = parseFloat(document.getElementById('kBase').value);
    const salarioOferecido = parseFloat(document.getElementById('salarioOferecido').value);
    const luvasOferecidas = parseFloat(document.getElementById('luvasOferecidas').value);
    
    const reputacaoTime = parseInt(document.getElementById('reputacaoTime').value);
    const reputacaoJogador = parseInt(document.getElementById('reputacaoJogador').value);
    const usarDeltaRep = document.getElementById('usarDeltaReputacao').checked;

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

    // 4. LÓGICA DE MULTIPLICADOR (DUPLO: Máxima e Sugerida)
    let multiplicadorMax = 0;
    let multiplicadorSug = 0;
    
    // Variáveis para detalhamento visual
    let detalheK = 0, detalheRep = 0, detalheSal = 0, detalheLuv = 0;
    
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
        detalheRep = 0;
        detalheLuv = 0;

    } else {
        // --- SUPERÁVIT / NEUTRO ---
        
        // 1. Definição do K (Base)
        // Max usa o K cheio digitado. Sugerida usa uma fração baseada no perfil.
        // Ex: Se K=1.2 (lucro 0.2), perfil 0.8 aceita lucro de 0.16 -> K=1.16
        const kSugCalculado = 1 + ((kBase - 1) * perfilDados.k_factor);

        multiplicadorMax = kBase;
        multiplicadorSug = kSugCalculado;
        detalheK = kBase;

        // 2. Delta Reputação (Igual para ambos)
        if (usarDeltaRep) {
            detalheRep = (reputacaoTime - reputacaoJogador) / 100;
            multiplicadorMax += detalheRep;
            multiplicadorSug += detalheRep;
        }

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

    // 5. RENDERIZAÇÃO DOS RESULTADOS
    const multaSugeridaFinal = valorMercado * multiplicadorSug;
    const multaMaximaFinal = valorMercado * multiplicadorMax;
    const multaSugeridaEuro = multaSugeridaFinal * TAXA_BRL_EUR;
    const multaMaximaEuro = multaMaximaFinal * TAXA_BRL_EUR;

    // NOVO LAYOUT - SCOREBOARD
    document.getElementById('multaSugBRL').textContent = formatarBRL(multaSugeridaFinal);
    document.getElementById('multaSugEUR').textContent = formatarEUR(multaSugeridaEuro);
    document.getElementById('multaMaxBRL').textContent = formatarBRL(multaMaximaFinal);
    document.getElementById('multaMaxEUR').textContent = formatarEUR(multaMaximaEuro);
    document.getElementById('labelPerfil').textContent = perfilDados.label;

    // Adicionar badges de percentagem para as multas
    const percentMultaSug = calcularPercentual(multaSugeridaFinal, valorMercado);
    const percentMultaMax = calcularPercentual(multaMaximaFinal, valorMercado);
    
    const badgeMultaSug = document.getElementById('percentMultaSug');
    badgeMultaSug.textContent = (percentMultaSug >= 0 ? '+' : '') + percentMultaSug.toFixed(1) + '%';
    badgeMultaSug.classList.remove('aumentou', 'diminuiu');
    if (percentMultaSug > 0) {
        badgeMultaSug.classList.add('aumentou');
    } else if (percentMultaSug < 0) {
        badgeMultaSug.classList.add('diminuiu');
    }

    const badgeMultaMax = document.getElementById('percentMultaMax');
    badgeMultaMax.textContent = (percentMultaMax >= 0 ? '+' : '') + percentMultaMax.toFixed(1) + '%';
    badgeMultaMax.classList.remove('aumentou', 'diminuiu');
    if (percentMultaMax > 0) {
        badgeMultaMax.classList.add('aumentou');
    } else if (percentMultaMax < 0) {
        badgeMultaMax.classList.add('diminuiu');
    }

    // NOVO LAYOUT - MATH VISUAL
    document.getElementById('mathK').textContent = deltaGlobal < 0 ? "1.00" : formatarDecimal(kBase, 2);
    document.getElementById('mathRep').textContent = (detalheRep >= 0 ? '+' : '') + formatarDecimal(detalheRep, 4);
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
    document.getElementById('mathExplanation').textContent = explanation;

    // ===== INJEÇÃO DE TOOLTIPS DIDÁTICOS (MATH-STEPS) =====
    
    // 1. K Base
    let kText = "";
    if (deltaGlobal < 0) {
        kText = "Anulado devido ao Déficit Financeiro. O sistema travou a base em 1.0x (Valor de Mercado).";
    } else {
        kText = `Sua pedida inicial foi ${formatarDecimal(kBase, 2)}. O perfil '${perfilDados.label}' aceitou ${formatarDecimal(perfilDados.k_factor * 100, 0)}% disso.`;
    }
    document.getElementById('stepKBase').dataset.tooltip = kText;

    // 2. Reputação
    let repText = "";
    if (deltaGlobal < 0) {
        repText = "Bônus de reputação ignorado devido ao Déficit.";
    } else if (usarDeltaRep) {
        const repDiff = reputacaoTime - reputacaoJogador;
        const repDirection = repDiff > 0 ? 'maior' : (repDiff < 0 ? 'menor' : 'igual');
        repText = `O Time (${reputacaoTime}) é ${repDirection} que o Jogador (${reputacaoJogador}). Isso gerou um ajuste de ${detalheRep > 0 ? '+' : ''}${formatarDecimal(detalheRep, 4)} na multa.`;
    } else {
        repText = "Cálculo de reputação desativado.";
    }
    document.getElementById('stepRep').dataset.tooltip = repText;

    // 3. Salário
    let salText = "";
    if (deltaGlobal < 0) {
        salText = `PENALIDADE: Sua oferta total está ${formatarDecimal(deltaGlobal*100, 1)}% abaixo do mínimo exigido pelo jogador.`;
    } else {
        const aumentoSal = dadosBase.salario_base > 0 ? ((salarioOferecido - dadosBase.salario_base) / dadosBase.salario_base) * 100 : 0;
        salText = `Você ofereceu +${formatarDecimal(aumentoSal, 1)}% de salário. O perfil '${perfilDados.label}' converteu isso com peso ${formatarDecimal(perfilDados.sal, 2)}.`;
    }
    document.getElementById('stepSal').dataset.tooltip = salText;

    // 4. Luvas
    let luvText = "";
    if (deltaGlobal < 0) {
        luvText = "Impacto das luvas anulado pelo Déficit Global.";
    } else {
        const luvaBaseTotalPeriodo = dadosBase.luvas_base * anosContrato;
        const aumentoLuv = (luvaBaseTotalPeriodo > 0) ? ((luvasOferecidas - luvaBaseTotalPeriodo) / luvaBaseTotalPeriodo) * 100 : 0;
        luvText = `Comparado ao custo total (${anosContrato} anos), sua luva variou ${formatarDecimal(aumentoLuv, 1)}%. Peso aplicado: ${formatarDecimal(perfilDados.luv, 2)}.`;
    }
    document.getElementById('stepLuv').dataset.tooltip = luvText;

    // 5. Extras
    document.getElementById('stepEps').dataset.tooltip = 
        `Soma de ${influenciasExternas.length} fatores externos manuais.`;


    // Grid de detalhes (mantém os elementos para referência)
    document.getElementById('valorMercado').textContent = formatarBRL(valorMercado);
    document.getElementById('dadosJogador').textContent = `${posicao} • ${idade}a • OVR ${overall}`;
    
    document.getElementById('salarioBase').textContent = formatarBRL(dadosBase.salario_base);
    document.getElementById('luvasBase').textContent = formatarBRL(dadosBase.luvas_base * anosContrato);

    atualizarBadgePercentual('salarioOferecidoValue', 'salarioOferecidoShow', 'percentSalario', salarioOferecido, dadosBase.salario_base);
    atualizarBadgePercentual('luvasOferecidasValue', 'luvasOferecidasShow', 'percentLuvas', luvasOferecidas, (dadosBase.luvas_base * anosContrato));

    document.getElementById('vtcBase').textContent = formatarBRL(vtcBase);
    atualizarBadgePercentual('vtcOferecidoValue', 'vtcOferecidoShow', 'percentVTC', vtcOferecido, vtcBase);

    // Mostrar resultado
    document.getElementById('resultado').classList.add('show');
}

// ============================================
// ATUALIZAR DESCRIÇÃO DA MULTA BASE DINAMICAMENTE
// ============================================

function atualizarDescricaoKBase() {
    const kBaseInput = document.getElementById('kBase');
    const helpText = document.getElementById('helpTextKBase');
    const kValue = parseFloat(kBaseInput.value);
    const percentual = ((kValue - 1) * 100).toFixed(1);
    helpText.textContent = `Multiplicador de ${percentual}% acima do valor`;
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Draence Calculator v3.0 iniciado');

    // Popula posições
    const posicoes = [...new Set(DB_MERCADO.map(r => r.posicao))].sort();
    posicoes.forEach(pos => {
        const option = document.createElement('option');
        option.value = pos;
        option.textContent = pos;
        selectPosicao.appendChild(option);
    });

    // Formulário
    const form = document.getElementById('formCalculo');
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
        document.getElementById('reputacaoTime').value = 50;
        document.getElementById('reputacaoJogador').value = 50;
        document.getElementById('kBase').value = 1.2;
        document.getElementById('anosContrato').value = 3;
        document.getElementById('usarDeltaReputacao').checked = true;
        inputReputacaoTime.disabled = false;
        inputReputacaoJogador.disabled = false;
        document.getElementById('salarioOferecido').value = '';
        document.getElementById('luvasOferecidas').value = '';
        document.getElementById('posicao').value = '';
        document.getElementById('idade').value = '';
        document.getElementById('overall').value = '';
    });

    // Botão adicionar influência
    document.getElementById('btnAdicionarInfluencia').addEventListener('click', (e) => {
        e.preventDefault();
        adicionarInfluencia();
    });

    // Event listener para atualizar descrição da multa base dinamicamente
    const kBaseInput = document.getElementById('kBase');
    if (kBaseInput) {
        kBaseInput.addEventListener('input', atualizarDescricaoKBase);
        // Chamar uma vez na inicialização
        atualizarDescricaoKBase();
    }

    // Inicializar com uma influência
    adicionarInfluencia();
});
