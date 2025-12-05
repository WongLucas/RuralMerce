function getCurrentType() {
  const activeBtn = document.querySelector('.filter-btn.bg-\\[\\#8a2f32\\]');
  return activeBtn ? activeBtn.dataset.type : 'All';
}

// 2. Função Principal
async function loadData(page, type) {
  const container = document.getElementById('table-container');
  const buttons = document.querySelectorAll('.filter-btn');

  // Pega o valor do select de forma segura
  const sortElement = document.getElementById('sortOrder');
  const sort = sortElement ? sortElement.value : 'newest';

  // UI Loading
  if (container) {
      container.style.opacity = '0.5';
      container.style.pointerEvents = 'none';
  }

  // Atualiza botões
  buttons.forEach(btn => {
    if (btn.dataset.type === type) {
       // Classes do botão ATIVO
       btn.className = "filter-btn px-4 py-1.5 rounded-lg text-sm font-medium transition-all border bg-[#8a2f32] text-white border-[#8a2f32] whitespace-nowrap";
    } else {
       // Classes do botão INATIVO
       btn.className = "filter-btn px-4 py-1.5 rounded-lg text-sm font-medium transition-all border text-gray-400 border-white/10 hover:bg-white/5 whitespace-nowrap";
    }
  });

  try {
    const params = new URLSearchParams({
       page: page,
       type: type,
       sort: sort,
       t: Date.now()
    });

    const response = await fetch(`?${params.toString()}`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });

    if (!response.ok) throw new Error('Erro na rede');

    const html = await response.text();

    if (container) {
        container.innerHTML = html;
    }

    // Atualiza URL
    const visibleParams = new URLSearchParams({ page, type, sort });
    const newUrl = `?${visibleParams.toString()}`;
    window.history.pushState({path: newUrl}, '', newUrl);

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    if (container) {
        container.style.opacity = '1';
        container.style.pointerEvents = 'auto';
    }
  }
}

// 3. Função de Ordenação
function applySort() {
  loadData(1, getCurrentType());
}

// 4. Configuração do botão voltar do navegador
window.onpopstate = function(event) {
   window.location.reload();
};

// --- O PULO DO GATO ---
// Expondo as funções para que o HTML consiga vê-las nos "onclick"
window.loadData = loadData;
window.applySort = applySort;
