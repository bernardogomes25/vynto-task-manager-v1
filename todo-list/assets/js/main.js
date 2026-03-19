// ==================== SELETORES ====================
const btnNovaTarefa = document.querySelector('.btn-nova-tarefa');
const modal = document.getElementById('modalTarefa');
const modalOverlay = document.getElementById('modalOverlay');
const fecharModal = document.querySelector('.fechar-modal');
const formTarefa = document.getElementById('formTarefa');
const btnCancelar = document.querySelector('.btn-cancelar');
const tarefasLista = document.querySelector('.tarefas-lista');
const vagioMsg = document.querySelector('.vazio-msg');
const filtrosBtn = document.querySelectorAll('.filtro-btn');

// Input fields
const inputNome = document.getElementById('nometarefa');
const inputDescricao = document.getElementById('descricao');
const inputDataConclusao = document.getElementById('dataConclusao');
const inputAnexos = document.getElementById('anexos');
const listaAnexos = document.getElementById('listaAnexos');

// Toast
const toast = document.getElementById('toast');
const toastIcone = document.getElementById('toastIcone');
const toastMensagem = document.getElementById('toastMensagem');
const toastFechar = document.getElementById('toastFechar');

// Modal de Confirmação
const modalConfirmacao = document.getElementById('modalConfirmacao');
const modalConfirmacaoOverlay = document.getElementById('modalConfirmacaoOverlay');
const btnConfirmarSim = document.getElementById('btnConfirmarSim');
const btnConfirmarNao = document.getElementById('btnConfirmarNao');
const confirmacaoMensagem = document.getElementById('confirmacaoMensagem');
const confirmacaoTitulo = document.getElementById('confirmacaoTitulo');
const confirmacaoIcone = document.getElementById('confirmacaoIcone');

// Modal de Detalhes
const modalDetalhes = document.getElementById('modalDetalhes');
const modalDetalhesOverlay = document.getElementById('modalDetalhesOverlay');
const fecharModalDetalhes = document.getElementById('fecharModalDetalhes');
const btnDetalheEditar = document.getElementById('btnDetalheEditar');
const btnDetalheDeletar = document.getElementById('btnDetalheDeletar');
const detalheNome = document.getElementById('detalheNome');
const detalheDescricao = document.getElementById('detalheDescricao');
const detalheCriacao = document.getElementById('detalheCriacao');
const detalheConclusao = document.getElementById('detalheConclusao');
const detalheStatus = document.getElementById('detalheStatus');
const detalheImportancia = document.getElementById('detalheImportancia');
const detalheAnexosContainer = document.getElementById('detalheAnexosContainer');
const detalheAnexos = document.getElementById('detalheAnexos');

// Scroll no Modal
const modalBodyScrollables = document.querySelectorAll('.modal-body-scrollable');
const modalBodyScrollable = document.querySelector('#modalTarefa .modal-body-scrollable');
const modalBodyScrollableDetalhes = document.querySelector('#modalDetalhes .modal-body-scrollable');
const modalScrollButtons = document.querySelectorAll('.modal-scroll-buttons');
const btnScrollUp = document.querySelector('#modalTarefa .btn-scroll-up');
const btnScrollDown = document.querySelector('#modalTarefa .btn-scroll-down');
const btnScrollUpDetalhes = document.querySelector('#modalDetalhes .btn-scroll-up');
const btnScrollDownDetalhes = document.querySelector('#modalDetalhes .btn-scroll-down');

// ==================== ESTADO ====================
let tarefas = [];
let tarefaEmEdicao = null;
let filtroAtivo = 'todas';
let tarefaParaDeletar = null;
let toastTimeout = null;
let tarefaEmDetalhes = null;
let dropdownAberto = false;
let anexosSelecionados = [];
let anexosCarregadosCount = 0;
let anexosTotalCount = 0;

// ==================== INICIALIZAÇÃO ====================
function init() {
    carregarTarefas();
    renderizarTarefas();
    adicionarEventListeners();
}

// ==================== NOTIFICAÇÕES E CONFIRMAÇÕES ====================
function mostrarToast(mensagem, tipo = 'info') {
    const icones = {
        'info': 'ℹ️',
        'sucesso': '✅',
        'erro': '❌',
        'aviso': '⚠️'
    };
    
    toastMensagem.textContent = mensagem;
    toastIcone.textContent = icones[tipo] || icones['info'];
    
    // Remove classes anteriores
    toast.classList.remove('sucesso', 'erro', 'aviso');
    
    // Adiciona classe do tipo
    if (tipo !== 'info') {
        toast.classList.add(tipo);
    }
    
    // Mostra o toast
    toast.classList.add('ativo');
    
    // Limpa timeout anterior
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    // Esconde automaticamente após 4 segundos
    toastTimeout = setTimeout(fecharToast, 4000);
}

function fecharToast() {
    toast.classList.remove('ativo');
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
}

function mostrarConfirmacao(titulo, mensagem, icone = '⚠️', callback = null) {
    confirmacaoTitulo.textContent = titulo;
    confirmacaoMensagem.textContent = mensagem;
    confirmacaoIcone.textContent = icone;
    
    // Armazena a callback
    btnConfirmarSim.onclick = () => {
        if (callback) callback();
        fecharConfirmacao();
    };
    
    modalConfirmacao.classList.add('ativo');
    modalConfirmacaoOverlay.classList.add('ativo');
}

function fecharConfirmacao() {
    modalConfirmacao.classList.remove('ativo');
    modalConfirmacaoOverlay.classList.remove('ativo');
}

function cancelarConfirmacao() {
    tarefaParaDeletar = null;
    fecharConfirmacao();
}

function adicionarEventListeners() {
    // Event listeners gerais
    if (btnNovaTarefa) btnNovaTarefa.addEventListener('click', abrirModal);
    if (fecharModal) fecharModal.addEventListener('click', fecharModalTarefa);
    if (modalOverlay) modalOverlay.addEventListener('click', fecharModalTarefa);
    if (btnCancelar) btnCancelar.addEventListener('click', fecharModalTarefa);
    if (formTarefa) formTarefa.addEventListener('submit', salvarTarefa);
    if (toastFechar) toastFechar.addEventListener('click', fecharToast);
    if (btnConfirmarSim) btnConfirmarSim.addEventListener('click', confirmaAcaoDeletar);
    if (btnConfirmarNao) btnConfirmarNao.addEventListener('click', cancelarConfirmacao);
    if (modalConfirmacaoOverlay) modalConfirmacaoOverlay.addEventListener('click', cancelarConfirmacao);
    if (fecharModalDetalhes) fecharModalDetalhes.addEventListener('click', fecharModalDetalhesFunc);
    if (modalDetalhesOverlay) modalDetalhesOverlay.addEventListener('click', fecharModalDetalhesFunc);
    if (btnDetalheEditar) btnDetalheEditar.addEventListener('click', editarDoDetalhes);
    if (btnDetalheDeletar) btnDetalheDeletar.addEventListener('click', deletarDoDetalhes);
    
    // Anexos (se existirem)
    if (inputAnexos) inputAnexos.addEventListener('change', processarAnexos);
    
    // Filtros
    if (filtrosBtn && filtrosBtn.length > 0) {
        filtrosBtn.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filtrosBtn.forEach(b => b.classList.remove('ativo'));
                e.target.classList.add('ativo');
                filtroAtivo = e.target.dataset.filtro;
                renderizarTarefas();
            });
        });
    }
    
    // Scroll no modal - Modal de Tarefa
    if (btnScrollUp && btnScrollDown && modalBodyScrollable) {
        btnScrollUp.addEventListener('click', () => scrollModalUp(modalBodyScrollable));
        btnScrollDown.addEventListener('click', () => scrollModalDown(modalBodyScrollable));
        modalBodyScrollable.addEventListener('scroll', () => atualizarBotoesScroll(modalBodyScrollable, btnScrollUp, btnScrollDown, modalScrollButtons[0]));
    }
    
    // Scroll no modal - Modal de Detalhes
    if (btnScrollUpDetalhes && btnScrollDownDetalhes && modalBodyScrollableDetalhes) {
        btnScrollUpDetalhes.addEventListener('click', () => scrollModalUp(modalBodyScrollableDetalhes));
        btnScrollDownDetalhes.addEventListener('click', () => scrollModalDown(modalBodyScrollableDetalhes));
        modalBodyScrollableDetalhes.addEventListener('scroll', () => atualizarBotoesScroll(modalBodyScrollableDetalhes, btnScrollUpDetalhes, btnScrollDownDetalhes, modalScrollButtons[1]));
    }
}

// ==================== CONTROLE DE SCROLL NO MODAL ====================
function atualizarBotoesScroll(scrollContainer, btnUp, btnDown, scrollButtonsContainer) {
    if (!scrollContainer) return;
    
    const podeRolar = scrollContainer.scrollHeight > scrollContainer.clientHeight;
    
    if (podeRolar) {
        if (scrollButtonsContainer) scrollButtonsContainer.classList.add('ativo');
        
        // Habilitar/desabilitar botões
        if (btnUp) {
            btnUp.disabled = scrollContainer.scrollTop === 0;
        }
        if (btnDown) {
            btnDown.disabled = 
                scrollContainer.scrollTop >= 
                scrollContainer.scrollHeight - scrollContainer.clientHeight - 10;
        }
    } else {
        if (scrollButtonsContainer) scrollButtonsContainer.classList.remove('ativo');
    }
}

function scrollModalUp(scrollContainer) {
    if (!scrollContainer) return;
    scrollContainer.scrollBy({
        top: -100,
        behavior: 'smooth'
    });
}

function scrollModalDown(scrollContainer) {
    if (!scrollContainer) return;
    scrollContainer.scrollBy({
        top: 100,
        behavior: 'smooth'
    });
}

// ==================== MODAL ====================
function abrirModal(id = null) {
    limparFormulario();
    
    if (id) {
        tarefaEmEdicao = tarefas.find(t => t.id === id);
        if (tarefaEmEdicao) {
            document.getElementById('modalTitulo').innerText = 'Editar Tarefa';
            inputNome.value = tarefaEmEdicao.nome;
            inputDescricao.value = tarefaEmEdicao.descricao;
            inputDataConclusao.value = tarefaEmEdicao.dataConclusao;
        }
    } else {
        tarefaEmEdicao = null;
        document.getElementById('modalTitulo').innerText = 'Nova Tarefa';
    }
    
    modal.classList.add('ativo');
    modalOverlay.classList.add('ativo');
    inputNome.focus();
    
    // Se houver modal body scrollable, resetar scroll e atualizar botões
    if (modalBodyScrollable && modalScrollButtons[0]) {
        setTimeout(() => {
            modalBodyScrollable.scrollTop = 0;
            atualizarBotoesScroll(modalBodyScrollable, btnScrollUp, btnScrollDown, modalScrollButtons[0]);
        }, 50);
    }
}

function fecharModalTarefa() {
    modal.classList.remove('ativo');
    modalOverlay.classList.remove('ativo');
    tarefaEmEdicao = null;
    limparFormulario();
}

function limparFormulario() {
    formTarefa.reset();
    inputNome.value = '';
    inputDescricao.value = '';
    inputDataConclusao.value = '';
    anexosSelecionados = [];
    anexosTotalCount = 0;
    anexosCarregadosCount = 0;
    listaAnexos.innerHTML = '';
}

// ==================== PROCESSAR ANEXOS ====================
function processarAnexos(e) {
    const files = e.target.files;
    anexosSelecionados = [];
    listaAnexos.innerHTML = '';
    
    if (files.length === 0) {
        anexosTotalCount = 0;
        anexosCarregadosCount = 0;
        return;
    }
    
    anexosTotalCount = files.length;
    anexosCarregadosCount = 0;
    
    Array.from(files).forEach((file, index) => {
        // Ler o arquivo como base64
        const reader = new FileReader();
        reader.onload = (event) => {
            anexosSelecionados.push({
                nome: file.name,
                tipo: file.type,
                tamanho: file.size,
                índice: index,
                dados: event.target.result
            });
            anexosCarregadosCount++;
            adicionarItemAnexoAoFormulario(file, index);
        };
        reader.onerror = () => {
            console.error('Erro ao ler arquivo:', file.name);
            mostrarToast(`Erro ao carregar ${file.name}`, 'erro');
            anexosCarregadosCount++;
        };
        reader.readAsDataURL(file);
    });
}

function adicionarItemAnexoAoFormulario(file, index) {
    const itemAnexo = document.createElement('div');
    itemAnexo.className = 'anexo-item';
    itemAnexo.innerHTML = `
        <span class="anexo-icone">${obterIconeAnexo(file.type)}</span>
        <span class="anexo-info">
            <span class="anexo-nome">${escapeHtml(file.name)}</span>
            <span class="anexo-tamanho">${formatarTamanhoArquivo(file.size)}</span>
        </span>
        <button class="anexo-remover" type="button">✕</button>
    `;
    
    itemAnexo.querySelector('.anexo-remover').addEventListener('click', (e) => {
        e.preventDefault();
        removerAnexo(index);
    });
    
    listaAnexos.appendChild(itemAnexo);
}

function removerAnexo(index) {
    anexosSelecionados = anexosSelecionados.filter((_, i) => i !== index);
    
    // Reconstruir lista visual
    const files = inputAnexos.files;
    listaAnexos.innerHTML = '';
    
    Array.from(files).forEach((file, i) => {
        if (anexosSelecionados.some(a => a.index === i)) {
            const itemAnexo = document.createElement('div');
            itemAnexo.className = 'anexo-item';
            itemAnexo.innerHTML = `
                <span class="anexo-icone">${obterIconeAnexo(file.type)}</span>
                <span class="anexo-info">
                    <span class="anexo-nome">${escapeHtml(file.name)}</span>
                    <span class="anexo-tamanho">${formatarTamanhoArquivo(file.size)}</span>
                </span>
                <button class="anexo-remover" type="button">✕</button>
            `;
            
            itemAnexo.querySelector('.anexo-remover').addEventListener('click', (e) => {
                e.preventDefault();
                removerAnexo(i);
            });
            
            listaAnexos.appendChild(itemAnexo);
        }
    });
}

function obterIconeAnexo(tipo) {
    if (tipo.startsWith('image/')) return '🖼️';
    if (tipo === 'application/pdf') return '📄';
    if (tipo.includes('word')) return '📝';
    if (tipo.includes('sheet')) return '📊';
    if (tipo === 'application/zip' || tipo === 'application/x-zip-compressed') return '📦';
    return '📎';
}

function formatarTamanhoArquivo(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ==================== SALVAR TAREFA ====================
function salvarTarefa(e) {
    e.preventDefault();
    
    // Verificar se todos os anexos foram carregados
    if (anexosTotalCount > 0 && anexosCarregadosCount < anexosTotalCount) {
        mostrarToast('Aguardando carregamento dos arquivos...', 'aviso');
        return;
    }
    
    const nome = inputNome.value.trim();
    const descricao = inputDescricao.value.trim();
    const dataConclusao = inputDataConclusao.value;
    
    if (!nome) {
        mostrarToast('Por favor, insira o nome da tarefa!', 'aviso');
        inputNome.focus();
        return;
    }
    
    if (tarefaEmEdicao) {
        // Editar tarefa existente
        tarefaEmEdicao.nome = nome;
        tarefaEmEdicao.descricao = descricao;
        tarefaEmEdicao.dataConclusao = dataConclusao;
        tarefaEmEdicao.anexos = anexosSelecionados;
        mostrarToast('Tarefa atualizada com sucesso! ✏️', 'sucesso');
    } else {
        // Criar nova tarefa
        const novaTarefa = {
            id: Date.now(),
            nome: nome,
            descricao: descricao,
            dataCriacao: obterDataAtual(),
            dataConclusao: dataConclusao,
            concluida: false,
            importante: false,
            anexos: anexosSelecionados
        };
        tarefas.push(novaTarefa);
        mostrarToast('Tarefa criada com sucesso! 🎉', 'sucesso');
    }
    
    salvarTarefasNoStorage();
    renderizarTarefas();
    fecharModalTarefa();
}

// ==================== DELETAR TAREFA ====================
function deletarTarefa(id) {
    tarefaParaDeletar = id;
    mostrarConfirmacao(
        'Excluir tarefa?',
        'Esta ação não pode ser desfeita. Tem certeza que deseja excluir esta tarefa?',
        '🗑️'
    );
}

function confirmaAcaoDeletar() {
    if (tarefaParaDeletar) {
        tarefas = tarefas.filter(t => t.id !== tarefaParaDeletar);
        salvarTarefasNoStorage();
        renderizarTarefas();
        mostrarToast('Tarefa excluída com sucesso!', 'sucesso');
        tarefaParaDeletar = null;
    }
}

// ==================== MARCAR COMO CONCLUÍDO ====================
function marcarConcluido(id) {
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
        tarefa.concluida = !tarefa.concluida;
        salvarTarefasNoStorage();
        renderizarTarefas();
    }
}

// ==================== MARCAR COMO IMPORTANTE ====================
function marcarImportante(id) {
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
        tarefa.importante = !tarefa.importante;
        mostrarToast(
            tarefa.importante ? 'Marcada como importante! 🚩' : 'Removida de importantes',
            'sucesso'
        );
        salvarTarefasNoStorage();
        renderizarTarefas();
    }
}

// ==================== MODAL DE DETALHES ====================
function abrirDetalhes(id) {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;
    
    tarefaEmDetalhes = tarefa;
    
    // Preencher os detalhes
    detalheNome.textContent = escapeHtml(tarefa.nome);
    
    // Descrção com URLs clicáveis
    if (tarefa.descricao) {
        detalheDescricao.innerHTML = converterURLsEmLinks(escapeHtml(tarefa.descricao));
    } else {
        detalheDescricao.textContent = 'Sem descrição';
    }
    
    detalheCriacao.textContent = formatarData(tarefa.dataCriacao);
    detalheConclusao.textContent = tarefa.dataConclusao ? formatarData(tarefa.dataConclusao) : 'Sem data de conclusão';
    
    // Status
    const statusTexto = tarefa.concluida ? '✅ Concluída' : '⏳ Pendente';
    detalheStatus.textContent = statusTexto;
    
    // Importância
    const importanciaTexto = tarefa.importante ? '🚩 Importante' : '⭕ Normal';
    detalheImportancia.textContent = importanciaTexto;
    
    // Anexos
    if (tarefa.anexos && tarefa.anexos.length > 0) {
        detalheAnexosContainer.style.display = 'block';
        detalheAnexos.innerHTML = '';
        tarefa.anexos.forEach((anexo, idx) => {
            const itemAnexo = document.createElement('div');
            itemAnexo.className = 'detalhe-anexo-item';
            const temDados = anexo.dados ? true : false;
            const botaoDownload = temDados 
                ? `<button class="btn-download-anexo" title="Baixar arquivo">⬇️</button>`
                : `<span class="btn-download-anexo-desabilitado" title="Download não disponível para arquivos antigos">⚠️</span>`;
            
            itemAnexo.innerHTML = `
                <span class="detalhe-anexo-icone">${obterIconeAnexo(anexo.tipo)}</span>
                <div class="detalhe-anexo-info">
                    <span class="detalhe-anexo-nome">${escapeHtml(anexo.nome)}</span>
                    <span class="detalhe-anexo-tamanho">${formatarTamanhoArquivo(anexo.tamanho)}</span>
                </div>
                ${botaoDownload}
            `;
            
            if (temDados) {
                itemAnexo.querySelector('.btn-download-anexo').addEventListener('click', (e) => {
                    e.stopPropagation();
                    downloadAnexo(anexo);
                });
            }
            
            detalheAnexos.appendChild(itemAnexo);
        });
    } else {
        detalheAnexosContainer.style.display = 'none';
    }
    
    // Abrir modal
    modalDetalhes.classList.add('ativo');
    modalDetalhesOverlay.classList.add('ativo');
    
    // Se houver modal body scrollable, resetar scroll e atualizar botões
    if (modalBodyScrollableDetalhes && modalScrollButtons[1]) {
        setTimeout(() => {
            modalBodyScrollableDetalhes.scrollTop = 0;
            atualizarBotoesScroll(modalBodyScrollableDetalhes, btnScrollUpDetalhes, btnScrollDownDetalhes, modalScrollButtons[1]);
        }, 50);
    }
}

function fecharModalDetalhesFunc() {
    modalDetalhes.classList.remove('ativo');
    modalDetalhesOverlay.classList.remove('ativo');
    tarefaEmDetalhes = null;
}

function editarDoDetalhes() {
    if (tarefaEmDetalhes) {
        fecharModalDetalhesFunc();
        abrirModal(tarefaEmDetalhes.id);
    }
}

function deletarDoDetalhes() {
    if (tarefaEmDetalhes) {
        fecharModalDetalhesFunc();
        deletarTarefa(tarefaEmDetalhes.id);
    }
}

// ==================== RENDERIZAR TAREFAS ====================
function renderizarTarefas() {
    const tarefasFiltradas = filtrarTarefas();
    
    tarefasLista.innerHTML = '';
    
    // Se está na aba "Todas", separar tarefas pendentes e concluídas
    if (filtroAtivo === 'todas') {
        const tarefasPendentes = tarefasFiltradas.filter(t => !t.concluida)
            .sort((a, b) => b.importante - a.importante);
        const tarefasConcluidas = tarefasFiltradas.filter(t => t.concluida);
        
        // Se não há tarefas pendentes e nem concluídas
        if (tarefasPendentes.length === 0 && tarefasConcluidas.length === 0) {
            vagioMsg.style.display = 'block';
            return;
        }
        
        vagioMsg.style.display = 'none';
        
        // Renderizar tarefas pendentes
        tarefasPendentes.forEach(tarefa => {
            const li = criarElementoTarefa(tarefa);
            tarefasLista.appendChild(li);
        });
        
        // Renderizar dropdown de tarefas concluídas (se houver)
        if (tarefasConcluidas.length > 0) {
            const dropdownContainer = criarDropdownConcluidas(tarefasConcluidas);
            tarefasLista.appendChild(dropdownContainer);
        }
    } else {
        // Se está em outra aba, renderizar normalmente
        if (tarefasFiltradas.length === 0) {
            vagioMsg.style.display = 'block';
            return;
        }
        
        vagioMsg.style.display = 'none';
        
        const tarefasOrdenadas = tarefasFiltradas.sort((a, b) => b.importante - a.importante);
        tarefasOrdenadas.forEach(tarefa => {
            const li = criarElementoTarefa(tarefa);
            tarefasLista.appendChild(li);
        });
    }
}

function criarElementoTarefa(tarefa) {
    const li = document.createElement('li');
    li.className = `tarefa-item ${tarefa.concluida ? 'concluida' : ''} ${tarefa.importante ? 'importante' : ''}`;
    li.dataset.id = tarefa.id;
    
    const dataCriacao = formatarData(tarefa.dataCriacao);
    const dataConclusao = tarefa.dataConclusao ? formatarData(tarefa.dataConclusao) : 'Sem data';
    const temAnexos = tarefa.anexos && tarefa.anexos.length > 0;
    
    li.innerHTML = `
        <div class="tarefa-conteudo">
            <div class="tarefa-titulo">
                <input type="checkbox" class="checkbox-concluir" ${tarefa.concluida ? 'checked' : ''}>
                <h3>${escapeHtml(tarefa.nome)}${temAnexos ? ' 📎' : ''}</h3>
            </div>
            
            ${tarefa.descricao ? `<p class="tarefa-descricao">${escapeHtml(tarefa.descricao)}</p>` : ''}
            
            <div class="tarefa-datas">
                <span class="data-criacao">📅 Criada: ${dataCriacao}</span>
                <span class="data-conclusao">⏰ Conclusão: ${dataConclusao}</span>
            </div>
        </div>
        
        <div class="tarefa-acoes">
            <button class="btn-importante" title="Marcar como importante">${tarefa.importante ? '🚩' : '🚩'}</button>
            <button class="btn-editar" title="Editar">✏️</button>
            <button class="btn-deletar" title="Excluir">🗑️</button>
        </div>
    `;
    
    // Event listeners
    const checkbox = li.querySelector('.checkbox-concluir');
    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        marcarConcluido(tarefa.id);
    });
    
    const conteudo = li.querySelector('.tarefa-conteudo');
    conteudo.addEventListener('click', (e) => {
        // Verifica se o clique não foi no checkbox ou nos botões/ações
        if (!e.target.closest('.checkbox-concluir') && !e.target.closest('.tarefa-acoes')) {
            abrirDetalhes(tarefa.id);
        }
    });
    
    const btnImportante = li.querySelector('.btn-importante');
    btnImportante.addEventListener('click', (e) => {
        e.stopPropagation();
        marcarImportante(tarefa.id);
    });
    
    const btnEditar = li.querySelector('.btn-editar');
    btnEditar.addEventListener('click', (e) => {
        e.stopPropagation();
        abrirModal(tarefa.id);
    });
    
    const btnDeletar = li.querySelector('.btn-deletar');
    btnDeletar.addEventListener('click', (e) => {
        e.stopPropagation();
        deletarTarefa(tarefa.id);
    });
    
    return li;
}

// ==================== DROPDOWN DE TAREFAS CONCLUÍDAS ====================
function criarDropdownConcluidas(tarefasConcluidas) {
    const container = document.createElement('li');
    container.className = 'dropdown-concluidas-container';
    
    const btnDropdown = document.createElement('button');
    btnDropdown.className = 'dropdown-btn-concluidas';
    if (dropdownAberto) {
        btnDropdown.classList.add('ativo');
    }
    btnDropdown.innerHTML = `
        <span class="dropdown-icone">▼</span>
        <span class="dropdown-texto">Tarefas Concluídas</span>
        <span class="dropdown-contador">${tarefasConcluidas.length}</span>
    `;
    
    const listaConcluidas = document.createElement('ul');
    listaConcluidas.className = 'lista-concluidas';
    if (dropdownAberto) {
        listaConcluidas.classList.add('aberto');
    }
    
    // Renderizar cada tarefa concluída
    tarefasConcluidas.forEach(tarefa => {
        const li = criarElementoTarefa(tarefa);
        listaConcluidas.appendChild(li);
    });
    
    container.appendChild(btnDropdown);
    container.appendChild(listaConcluidas);
    
    // Event listener para abrir/fechar dropdown
    btnDropdown.addEventListener('click', (e) => {
        e.preventDefault();
        listaConcluidas.classList.toggle('aberto');
        btnDropdown.classList.toggle('ativo');
        dropdownAberto = !dropdownAberto;
    });
    
    return container;
}

// ==================== FILTRAR TAREFAS ====================
function filtrarTarefas() {
    switch (filtroAtivo) {
        case 'pendentes':
            return tarefas.filter(t => !t.concluida);
        case 'concluidas':
            return tarefas.filter(t => t.concluida);
        case 'todas':
        default:
            return tarefas;
    }
}

// ==================== STORAGE ====================
function salvarTarefasNoStorage() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

function carregarTarefas() {
    const dados = localStorage.getItem('tarefas');
    if (dados) {
        try {
            tarefas = JSON.parse(dados);
            // Migração: adicionar campos importantes e anexos para tarefas antigas
            tarefas = tarefas.map(tarefa => ({
                ...tarefa,
                importante: tarefa.importante ?? false,
                anexos: tarefa.anexos ?? []
            }));
        } catch (e) {
            console.error('Erro ao carregar tarefas:', e);
            tarefas = [];
        }
    }
}

// ==================== UTILIDADES ====================
function obterDataAtual() {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
}

function formatarData(data) {
    if (!data) return '';
    const date = new Date(data + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function converterURLsEmLinks(texto) {
    // Regex para detectar URLs
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    return texto.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" class="link-tarefa">${url}</a>`;
    });
}

// ==================== DOWNLOAD DE ANEXOS ====================
function downloadAnexo(anexo) {
    // Verificar se os dados existem
    if (!anexo || !anexo.dados) {
        mostrarToast('Arquivo não disponível para download', 'aviso');
        console.warn('Anexo sem dados:', anexo);
        return;
    }
    
    try {
        // Validar se é uma data URL válida
        if (!anexo.dados.startsWith('data:')) {
            mostrarToast('Formato de arquivo inválido', 'erro');
            return;
        }
        
        // Criar um link de download
        const link = document.createElement('a');
        link.href = anexo.dados;
        link.download = anexo.nome || 'arquivo';
        
        // Algumas browsers requerem que o link seja adicionado ao DOM
        document.body.appendChild(link);
        
        // Disparar o download
        link.click();
        
        // Remover o link
        document.body.removeChild(link);
        
        mostrarToast(`Baixando ${anexo.nome}...`, 'sucesso');
    } catch (erro) {
        console.error('Erro ao baixar anexo:', erro);
        mostrarToast('Erro ao baixar o arquivo. Tente novamente.', 'erro');
    }
}

// ==================== INICIAR ====================
init();