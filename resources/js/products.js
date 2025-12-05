function getCurrentType() {
  const activeBtn = document.querySelector('.filter-btn.bg-\\[\\#8a2f32\\]');
  return activeBtn ? activeBtn.dataset.type : 'All';
}

// 2. Função Principal
async function loadData(page, type) {
  const container = document.getElementById('table-container');
  const buttons = document.querySelectorAll('.filter-btn');

  // 1. UI Loading
  if (container) {
    container.style.opacity = '0.5';
    container.style.pointerEvents = 'none';
  }

  // 2. Atualiza botões visualmente
  buttons.forEach(btn => {
    if (btn.dataset.type === type) {
       btn.className = "filter-btn px-4 py-1.5 rounded-lg text-sm font-medium transition-all border bg-[#8a2f32] text-white border-[#8a2f32] whitespace-nowrap";
    } else {
       btn.className = "filter-btn px-4 py-1.5 rounded-lg text-sm font-medium transition-all border text-gray-400 border-white/10 hover:bg-white/5 whitespace-nowrap";
    }
  });

  try {
    const params = new URLSearchParams({
       page: page,
       type: type,
       t: Date.now()
    });

    const response = await fetch(`?${params.toString()}`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });

    if (!response.ok) throw new Error('Erro na rede');

    const html = await response.text();

    if (container) {
        container.innerHTML = html;

        // --- MUDANÇA AQUI ---
        // Em vez de scrollIntoView, calculamos a posição com uma margem (offset)

        // 1. Pega a posição absoluta do container na página
        const y = container.getBoundingClientRect().top + window.scrollY;

        // 2. Define quantos pixels acima você quer subir.
        // -150px costuma ser suficiente para mostrar os filtros e o título
        const offset = -150;

        window.scrollTo({
            top: y + offset,
            behavior: 'smooth'
        });
    }

    // Atualiza URL
    const visibleParams = new URLSearchParams({ page, type });
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

window.onpopstate = function(event) {
   window.location.reload();
};

window.loadData = loadData;

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
