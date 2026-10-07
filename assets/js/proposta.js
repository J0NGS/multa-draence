// ============================================
// MONTADOR DE PROPOSTAS
// ============================================

// Estado das listas dinâmicas
let premiacoesList = [];
let clausulasList = [];

function lerParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('salario')) {
        document.getElementById('salarioOferecido').value = params.get('salario');
    }
    if (params.has('luvas')) {
        document.getElementById('luvasOferecidas').value = params.get('luvas');
    }
    if (params.has('anos')) {
        document.getElementById('anosContrato').value = params.get('anos');
    }
    if (params.has('multa')) {
        document.getElementById('multaDraence').value = params.get('multa');
    }
    if (params.has('multaExterior')) {
        document.getElementById('multaExterior').value = params.get('multaExterior');
    }
}

function gerarTextoProposta() {
    const tipo = document.getElementById('tipoNegociacao').value || '---';
    const nome = document.getElementById('nomeJogador').value || '---';
    const anos = document.getElementById('anosContrato').value || '---';
    const valorCompra = parseMoney(document.getElementById('valorCompra').value) || 0;
    const formaPagamento = document.getElementById('formaPagamento').value || 'À definir';
    const luvas = parseMoney(document.getElementById('luvasOferecidas').value) || 0;
    const salario = parseMoney(document.getElementById('salarioOferecido').value) || 0;
    const multaDraence = parseMoney(document.getElementById('multaDraence').value) || 0;
    const multaExterior = parseMoney(document.getElementById('multaExterior').value) || 0;
    
    // Formatar arrays de listas dinâmicas com bullets
    const textoPremiacoes = premiacoesList.length > 0 
        ? premiacoesList.map(item => `• ${item}`).join('\n')
        : '---';
    const textoClausulas = clausulasList.length > 0 
        ? clausulasList.map(item => `• ${item}`).join('\n')
        : '---';

    // Função de formatação para £D (Draence)
    const formatValueDraence = (val) => {
        if (!val || isNaN(val) || val === 0) return '---';
        const numero = Math.floor(val);
        const formatado = numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return '£D ' + formatado;
    };

    // Função de formatação para € (Euro - Exterior)
    const formatValueEuro = (val) => {
        if (!val || isNaN(val) || val === 0) return '---';
        const numero = Math.floor(val);
        const formatado = numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return '€ ' + formatado;
    };

    const texto = `*💼 TIPO DE NEGOCIAÇÃO*
${tipo}

*⚽ JOGADOR*
${nome} | ${document.getElementById('timeAtual').value || '---'}

*🗓️ DURAÇÃO*
${anos} temporada(s)

*💰 VALOR*
${formatValueDraence(valorCompra)}

*💵 LUVAS*
${formatValueDraence(luvas)}

*💸 SALÁRIO MENSAL*
${formatValueDraence(salario)}

*📝 PAGAMENTO*
${formaPagamento}

*🚫 MULTA DRAENCE*
${formatValueDraence(multaDraence)}

*🌍 MULTA EXTERIOR*
${formatValueEuro(multaExterior)}

*🏆 PREMIAÇÕES*
${textoPremiacoes}

*📋 CLÁUSULAS*
${textoClausulas}`;

    return texto;
}

function atualizarProposta() {
    const texto = gerarTextoProposta();
    document.getElementById('textoPreview').textContent = texto;
    atualizarStatusCards();
}

function atualizarStatusCards() {
    const cards = [
        { id: 'card-negociacao', fields: ['tipoNegociacao', 'nomeJogador', 'anosContrato'], statusId: 'status-negociacao' },
        { id: 'card-financeiro', fields: ['valorCompra', 'luvasOferecidas', 'salarioOferecido'], statusId: 'status-financeiro' },
        { id: 'card-multas', fields: ['multaDraence'], statusId: 'status-multas' }
    ];

    let allCardsOk = true;

    cards.forEach(cardData => {
        let cardOk = true;
        cardData.fields.forEach(fieldId => {
            const el = document.getElementById(fieldId);
            if (!el || !el.value || !el.value.trim()) {
                cardOk = false;
            }
        });

        const statusEl = document.getElementById(cardData.statusId);
        if (statusEl) {
            if (cardOk) {
                statusEl.classList.add('ok');
            } else {
                statusEl.classList.remove('ok');
                allCardsOk = false;
            }
        }
    });

    // Ativar step 4 se todos os cards estão OK
    const steps = document.querySelectorAll('.step-item');
    if (allCardsOk && steps.length > 3) {
        steps[3].classList.add('active');
    } else if (steps.length > 3) {
        steps[3].classList.remove('active');
    }
}

/**
 * Verifica se há texto pendente nos inputs de listas dinâmicas
 */
function verificarInputsPendentes() {
    const pendentePremio = document.getElementById('inputPremiacao').value.trim();
    const pendenteClausula = document.getElementById('inputClausula').value.trim();
    
    if (pendentePremio || pendenteClausula) {
        const items = [];
        if (pendentePremio) items.push(`• Premiação: "${pendentePremio}"`);
        if (pendenteClausula) items.push(`• Cláusula: "${pendenteClausula}"`);
        
        alert('⚠️ ATENÇÃO: Você digitou item(ns) mas não adicionou à lista:\n\n' + items.join('\n') + '\n\nClique "+" ou pressione Enter para adicionar antes de copiar!');
        return false;
    }
    return true;
}

function copiarProposta() {
    if (!verificarInputsPendentes()) return;
    
    const texto = gerarTextoProposta();
    const btnCopiar = document.getElementById('btnCopiar');
    
    navigator.clipboard.writeText(texto).then(() => {
        const textoOriginal = btnCopiar.textContent;
        btnCopiar.textContent = '✅ Copiado!';
        btnCopiar.style.backgroundColor = 'var(--accent-success)';
        
        setTimeout(() => {
            btnCopiar.textContent = textoOriginal;
            btnCopiar.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar para a área de transferência.');
    });
}

// ============================================
// FUNÇÕES DAS LISTAS DINÂMICAS
// ============================================

/**
 * Adiciona uma premiação à lista
 */
function adicionarPremiacao() {
    const input = document.getElementById('inputPremiacao');
    const valor = input.value.trim();
    
    if (!valor) {
        input.focus();
        return;
    }
    
    premiacoesList.push(valor);
    input.value = '';
    renderizarListas();
    atualizarProposta();
    input.focus();
}

/**
 * Adiciona uma cláusula à lista
 */
function adicionarClausula() {
    const input = document.getElementById('inputClausula');
    const valor = input.value.trim();
    
    if (!valor) {
        input.focus();
        return;
    }
    
    clausulasList.push(valor);
    input.value = '';
    renderizarListas();
    atualizarProposta();
    input.focus();
}

/**
 * Remove uma premiação pelo índice
 */
function removerPremiacao(index) {
    premiacoesList.splice(index, 1);
    renderizarListas();
    atualizarProposta();
}

/**
 * Remove uma cláusula pelo índice
 */
function removerClausula(index) {
    clausulasList.splice(index, 1);
    renderizarListas();
    atualizarProposta();
}

/**
 * Trata pressionar Enter nos inputs de listas dinâmicas
 */
function handleEnter(e, action) {
    if (e.key === 'Enter') {
        e.preventDefault();
        
        if (action === 'addPremiacao') {
            adicionarPremiacao();
        } else if (action === 'addClausula') {
            adicionarClausula();
        }
    }
}

/**
 * Renderiza as listas de premiações e cláusulas no DOM
 */
function renderizarListas() {
    // Renderizar premiações
    const listaPremiacoes = document.getElementById('listaPremiacoes');
    listaPremiacoes.innerHTML = '';
    
    premiacoesList.forEach((premiacao, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <span>${premiacao}</span>
            <button type="button" class="btn-remove-item" onclick="removerPremiacao(${index})" title="Remover">×</button>
        `;
        listaPremiacoes.appendChild(div);
    });

    // Renderizar cláusulas
    const listaClausulas = document.getElementById('listaClausulas');
    listaClausulas.innerHTML = '';
    
    clausulasList.forEach((clausula, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <span>${clausula}</span>
            <button type="button" class="btn-remove-item" onclick="removerClausula(${index})" title="Remover">×</button>
        `;
        listaClausulas.appendChild(div);
    });
}

// ============================================
// FIM - FUNÇÕES DAS LISTAS DINÂMICAS
// ============================================


document.getElementById('btnCopiar').addEventListener('click', copiarProposta);

// Inicializar ao carregar
window.addEventListener('load', () => {
    // Função auxiliar de formatação
    const formatMoneyDisplay = (valor) => {
        if (!valor || isNaN(valor)) return '';
        const numero = Math.floor(valor);
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const formatMoneyInputProposta = (event) => {
        const input = event.target;
        let valor = input.value.replace(/\D/g, '');
        
        if (valor) {
            valor = formatMoneyDisplay(parseInt(valor));
        }
        
        input.value = valor;
        
        // Atualizar badge
        const wrapper = input.parentElement;
        const badge = wrapper.querySelector('.magnitude-badge');
        if (badge) {
            const numeroLimpo = parseMoney(valor);
            badge.className = 'magnitude-badge';
            
            if (numeroLimpo >= 1000000) {
                badge.textContent = 'M';
                badge.classList.add('magnitude-M');
            } else if (numeroLimpo >= 1000) {
                badge.textContent = 'm';
                badge.classList.add('magnitude-m');
            } else {
                badge.textContent = '';
            }
        }
        
        atualizarProposta();
    };

    // Seleciona todos os inputs com classe 'input-money'
    const moneyInputs = document.querySelectorAll('.input-money');
    moneyInputs.forEach(input => {
        input.addEventListener('input', formatMoneyInputProposta);
        
        // Listener para validar limites ao sair do campo
        input.addEventListener('blur', (event) => {
            const inp = event.target;
            const min = Number(inp.dataset.min) || 0;
            const max = Number(inp.dataset.max) || 999999999;
            const valorAtual = parseMoney(inp.value);
            
            let valorCorrigido = valorAtual;
            if (valorAtual < min) {
                valorCorrigido = min;
            } else if (valorAtual > max) {
                valorCorrigido = max;
            }
            
            if (valorCorrigido !== valorAtual) {
                const valorFormatado = formatMoneyDisplay(valorCorrigido);
                inp.value = valorFormatado;
                
                const badge = inp.parentElement.querySelector('.magnitude-badge');
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
                atualizarProposta();
            }
        });
        
        // Formata valor padrão se existir
        if (input.value) {
            const event = { target: input };
            formatMoneyInputProposta(event);
        }
    });

    lerParametrosURL();
    
    // Formatar novamente após carregar parâmetros da URL
    moneyInputs.forEach(input => {
        if (input.value) {
            const event = { target: input };
            formatMoneyInputProposta(event);
        }
    });

    // Adicionar listeners para atualizar status e preview
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', () => {
            atualizarProposta();
        });
        el.addEventListener('change', () => {
            atualizarProposta();
        });
    });
    
    atualizarProposta();
});
