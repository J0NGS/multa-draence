// ============================================
// TABELA DE VALORES - SCRIPT COM SORTING E PAGINAÇÃO
// ============================================

const TAXA_BRL_EUR = 0.1667;
const REGISTROS_POR_PAGINA = 50;

// Estado da aplicação
let todosOsDados = [];
let dadosFiltrados = [];
let posicoes = new Set();
let paginaAtual = 1;
let sortAtual = { coluna: null, direcao: 'asc' };

// Funções Auxiliares
function formatarLD(valor) {
    if (!valor || isNaN(valor)) return 'N/A';
    return '£D ' + new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
}

function formatarEUR(valor) {
    if (!valor || isNaN(valor)) return 'N/A';
    const valorEur = valor * TAXA_BRL_EUR;
    return '€ ' + new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valorEur);
}

function obterSalarioBase(overall) {
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
    } : { salario_base: 0, luvas_base: 0 };
}

function preencherPosicoes() {
    DB_MERCADO.forEach(item => {
        posicoes.add(item.posicao);
    });

    const select = document.getElementById('filterPosicao');
    const posicoesSordenadas = Array.from(posicoes).sort();
    
    posicoesSordenadas.forEach(pos => {
        const option = document.createElement('option');
        option.value = pos;
        option.textContent = pos;
        select.appendChild(option);
    });
}

function prepararDados() {
    todosOsDados = [];

    DB_MERCADO.forEach(itemMercado => {
        const salarioBase = obterSalarioBase(itemMercado.overall);

        todosOsDados.push({
            posicao: itemMercado.posicao,
            idade: itemMercado.idade,
            overall: itemMercado.overall,
            valor_brl: itemMercado.valor_brl,
            valor_eur: itemMercado.valor_eur,
            salario_brl: salarioBase.salario_base,
            salario_eur: salarioBase.salario_base * TAXA_BRL_EUR,
            luvas_brl: salarioBase.luvas_base,
            luvas_eur: salarioBase.luvas_base * TAXA_BRL_EUR
        });
    });
}

function ordenarDados(coluna) {
    if (sortAtual.coluna === coluna) {
        sortAtual.direcao = sortAtual.direcao === 'asc' ? 'desc' : 'asc';
    } else {
        sortAtual.coluna = coluna;
        sortAtual.direcao = 'asc';
    }

    dadosFiltrados.sort((a, b) => {
        let valorA = a[coluna];
        let valorB = b[coluna];

        if (typeof valorA === 'string') {
            valorA = valorA.toUpperCase();
            valorB = valorB.toUpperCase();
        }

        if (valorA < valorB) return sortAtual.direcao === 'asc' ? -1 : 1;
        if (valorA > valorB) return sortAtual.direcao === 'asc' ? 1 : -1;
        return 0;
    });

    paginaAtual = 1;
    atualizarBotoesSorting();
    exibirPagina();
}

function atualizarBotoesSorting() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('sort-asc', 'sort-desc');
        
        if (btn.dataset.sort === sortAtual.coluna) {
            btn.classList.add(`sort-${sortAtual.direcao}`);
        }
    });
}

function filtrarDados() {
    const posicao = document.getElementById('filterPosicao').value;
    const overallMin = parseInt(document.getElementById('filterOverallMin').value) || 60;
    const overallMax = parseInt(document.getElementById('filterOverallMax').value) || 99;
    const idadeMin = parseInt(document.getElementById('filterIdadeMin').value) || 15;
    const idadeMax = parseInt(document.getElementById('filterIdadeMax').value) || 45;

    dadosFiltrados = todosOsDados.filter(item => {
        const matchPosicao = posicao === '' || item.posicao === posicao;
        const matchOverall = item.overall >= overallMin && item.overall <= overallMax;
        const matchIdade = item.idade >= idadeMin && item.idade <= idadeMax;

        return matchPosicao && matchOverall && matchIdade;
    });

    paginaAtual = 1;
    exibirPagina();
}

function exibirPagina() {
    const totalPaginas = Math.ceil(dadosFiltrados.length / REGISTROS_POR_PAGINA);
    const inicio = (paginaAtual - 1) * REGISTROS_POR_PAGINA;
    const fim = inicio + REGISTROS_POR_PAGINA;
    const dadosPagina = dadosFiltrados.slice(inicio, fim);

    preencherTabela(dadosPagina);
    atualizarContador(dadosPagina.length, dadosFiltrados.length);
    atualizarPaginacao(totalPaginas);
}

function preencherTabela(dados) {
    const tbody = document.getElementById('tabelaBody');
    tbody.innerHTML = '';

    if (dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-secondary);">Nenhum registro encontrado</td></tr>';
        return;
    }

    dados.forEach(item => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><span class="badge-posicao">${item.posicao}</span></td>
            <td>${item.idade}</td>
            <td class="font-bold">${item.overall}</td>
            <td>
                <div class="money-brl">${formatarLD(item.valor_brl)}</div>
                <div class="money-eur">${formatarEUR(item.valor_brl)}</div>
            </td>
            <td>
                <div class="money-brl">${formatarLD(item.salario_brl)}</div>
                <div class="money-eur">${formatarEUR(item.salario_brl)}</div>
            </td>
            <td>
                <div class="money-brl">${formatarLD(item.luvas_brl)}</div>
                <div class="money-eur">${formatarEUR(item.luvas_brl)}</div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function atualizarContador(exibidos, total) {
    const contador = document.getElementById('contadorRegistros');
    contador.textContent = `Exibindo ${exibidos} de ${total} registros`;
}

function atualizarPaginacao(totalPaginas) {
    const paginacaoInfo = document.getElementById('paginacaoInfo');
    const btnAnterior = document.getElementById('btnAnterior');
    const btnProximo = document.getElementById('btnProximo');

    paginacaoInfo.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
    
    btnAnterior.disabled = paginaAtual === 1;
    btnProximo.disabled = paginaAtual === totalPaginas || totalPaginas === 0;

    btnAnterior.style.opacity = paginaAtual === 1 ? '0.5' : '1';
    btnProximo.style.opacity = paginaAtual === totalPaginas || totalPaginas === 0 ? '0.5' : '1';
}

function limparFiltros() {
    document.getElementById('filterPosicao').value = '';
    document.getElementById('filterOverallMin').value = '';
    document.getElementById('filterOverallMax').value = '';
    document.getElementById('filterIdadeMin').value = '';
    document.getElementById('filterIdadeMax').value = '';
    
    filtrarDados();
}

// Event Listeners - Filtros
document.getElementById('btnFiltrar').addEventListener('click', filtrarDados);
document.getElementById('btnLimpar').addEventListener('click', limparFiltros);

// Event Listeners - Paginação
document.getElementById('btnAnterior').addEventListener('click', () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        exibirPagina();
        document.querySelector('.data-table').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

document.getElementById('btnProximo').addEventListener('click', () => {
    const totalPaginas = Math.ceil(dadosFiltrados.length / REGISTROS_POR_PAGINA);
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        exibirPagina();
        document.querySelector('.data-table').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

// Event Listeners - Sorting
document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        ordenarDados(btn.dataset.sort);
    });
});

// Permitir ENTER para filtrar
['filterPosicao', 'filterOverallMin', 'filterOverallMax', 'filterIdadeMin', 'filterIdadeMax'].forEach(id => {
    document.getElementById(id).addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filtrarDados();
    });
});

// Inicializar ao carregar a página
window.addEventListener('load', () => {
    preencherPosicoes();
    prepararDados();
    filtrarDados();
});
