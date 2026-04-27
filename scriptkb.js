let selectedColor = 'urgent';
let draggedCard = null;

// Dados iniciais (Seeds)
const seedTasks = [
  { name: 'Estudar Redes', desc: 'Revisar protocolos OSPF', col: 'todo', color: 'urgent' },
  { name: 'Projeto Kanban', desc: 'Subir no Github', col: 'progress', color: 'not-urgent' },
  { name: 'Configurar Lab', desc: 'VirtualBox e CyberOps', col: 'done', color: 'urgent' },
];

/* ── FUNÇÃO DE PERSISTÊNCIA (LOCALSTORAGE) ── */
function salvarDados() {
  const cards = [];
  document.querySelectorAll('.kb-card').forEach(card => {
    cards.push({
      name: card.querySelector('.card-name').innerText,
      desc: card.querySelector('.card-desc') ? card.querySelector('.card-desc').innerText : '',
      col: card.closest('.kb-col').dataset.col,
      color: card.classList.contains('urgent') ? 'urgent' : 'not-urgent'
    });
  });
  localStorage.setItem('meuKanbanDados', JSON.stringify(cards));
}

/* ── SELETOR DE CORES ── */
function selectColor(c) {
  selectedColor = c;
  document.getElementById('dot-urgent').classList.toggle('selected', c === 'urgent');
  document.getElementById('dot-not').classList.toggle('selected', c === 'not-urgent');
}

/* ── CRIAÇÃO DO CARD ── */
function makeCard(name, desc, color) {
  const card = document.createElement('div');
  card.className = `kb-card ${color}`;
  card.draggable = true;
  card.innerHTML = `
    <span class="card-name">${name}</span>
    ${desc ? `<span class="card-desc">${desc}</span>` : ''}
    <button class="card-del" title="Remover">×</button>
  `;

  // Remover card
  card.querySelector('.card-del').addEventListener('click', () => {
    card.remove();
    salvarDados();
  });

  // Drag events
  card.addEventListener('dragstart', () => {
    draggedCard = card;
    setTimeout(() => card.classList.add('dragging'), 0);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    draggedCard = null;
    document.querySelectorAll('.col-drop-zone').forEach(z => z.classList.remove('drag-over'));
  });

  return card;
}

/* ── ADICIONAR À COLUNA ── */
function addToCol(name, desc, colId, color) {
  const col = document.querySelector(`.kb-col[data-col="${colId}"]`);
  const zone = col.querySelector('.col-drop-zone');
  const card = makeCard(name, desc, color);
  col.insertBefore(card, zone);
  salvarDados(); // Salva ao criar novo card
}

/* ── DRAG & DROP ── */
document.querySelectorAll('.kb-col').forEach(col => {
  col.addEventListener('dragover', e => e.preventDefault());
  col.addEventListener('drop', e => {
    e.preventDefault();
    if (!draggedCard) return;
    const zone = col.querySelector('.col-drop-zone');
    col.insertBefore(draggedCard, zone);
    salvarDados(); // Salva ao mover card
  });
});

document.querySelectorAll('.col-drop-zone').forEach(zone => {
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (!draggedCard) return;
    const col = zone.closest('.kb-col');
    col.insertBefore(draggedCard, zone);
    salvarDados(); // Salva ao soltar na zona de drop
  });
});

/* ── MODAL ── */
const modalBg = document.getElementById('modal-bg');
const inpName = document.getElementById('inp-name');
const inpDesc = document.getElementById('inp-desc');
const inpCol = document.getElementById('inp-col');

function closeModal() {
  modalBg.classList.remove('open');
}

document.getElementById('open-modal').addEventListener('click', () => {
  modalBg.classList.add('open');
  inpName.focus();
});

document.getElementById('btn-cancel').addEventListener('click', closeModal);

modalBg.addEventListener('click', e => {
  if (e.target === modalBg) closeModal();
});

document.getElementById('btn-add').addEventListener('click', () => {
  const name = inpName.value.trim();
  if (!name) { inpName.focus(); return; }
  addToCol(name, inpDesc.value.trim(), inpCol.value, selectedColor);
  inpName.value = '';
  inpDesc.value = '';
  closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && modalBg.classList.contains('open')) {
    e.preventDefault();
    document.getElementById('btn-add').click();
  }
});

/* ── INICIALIZAÇÃO ── */
const dadosSalvos = localStorage.getItem('meuKanbanDados');
if (dadosSalvos) {
  JSON.parse(dadosSalvos).forEach(t => {
    // Usamos uma versão simplificada de addToCol aqui para evitar múltiplos salvamentos no loop inicial
    const col = document.querySelector(`.kb-col[data-col="${t.col}"]`);
    const zone = col.querySelector('.col-drop-zone');
    const card = makeCard(t.name, t.desc, t.color);
    col.insertBefore(card, zone);
  });
} else {
  seedTasks.forEach(t => addToCol(t.name, t.desc, t.col, t.color));
}