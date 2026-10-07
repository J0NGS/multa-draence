// ============================================
// EASTER EGG: Acesso ao Modo Admin (Clique no 2026)
// ============================================
let yearClickCount = 0;
let yearClickTimeout;

const yearClickableEl = document.getElementById('yearClickable');
if (yearClickableEl) {
    yearClickableEl.addEventListener('click', function() {
        yearClickCount++;
        
        // Reseta o contador após 2 segundos
        clearTimeout(yearClickTimeout);
        yearClickTimeout = setTimeout(() => {
            yearClickCount = 0;
        }, 2000);

        // Se atingiu 5 cliques em 2 segundos, redireciona para admin
        if (yearClickCount === 5) {
            yearClickCount = 0;
            globalThis.location.href = 'admin.html';
        }
    });
}
