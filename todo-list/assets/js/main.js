const input = document.querySelector('.input-tarefa');
const botao = document.querySelector('.btn-tarefa');
const tarefas = document.querySelector('.tarefas');

function criaLi() {
    const li = document.createElement('li');
    return li;
}

input.addEventListener('keypress', function (e) {
    if (e.keyCode === 13) {
        if (!input.value) return;
        criaTarefa(input.value);
    }
});

function limpaInput() {
    input.value = '';
    input.focus();
}

function criaBotaoApagar(li) {
    const botaoApagar = document.createElement('button');
    botaoApagar.innerText = '❌';
    botaoApagar.setAttribute('class', 'apagar');
    li.appendChild(botaoApagar);
}

function criaTarefa(textoInput) {
    const li = criaLi();
    li.innerText = textoInput;
    tarefas.appendChild(li);
    limpaInput();
    criaBotaoApagar(li);
    salvarTarefas();
}

document.addEventListener('click', function (e) {
    const el = e.target;

    if (el.classList.contains('apagar')) {
        el.parentElement.remove();
        salvarTarefas();
    }
});

botao.addEventListener('click', function () {
    if (!input.value) return;
    criaTarefa(input.value);
});

function salvarTarefas() {
    const liTarefas = tarefas.querySelectorAll('li');
    const listaDeTarefas = [];

    for (let tarefa of liTarefas) {
        let tarefaTxt = tarefa.innerText;
        tarefaTxt = tarefaTxt.replace('❌', '').trim();
        listaDeTarefas.push(tarefaTxt);
    }

    const tarefasJSON = JSON.stringify(listaDeTarefas);

    localStorage.setItem('tarefas', tarefasJSON);
}

function carregaTarefasSalvas() {
    const tarefas = localStorage.getItem('tarefas');
    const listaDeTarefas = JSON.parse(tarefas);

    for (let tarefa of listaDeTarefas) {
        criaTarefa(tarefa);
    }
}
carregaTarefasSalvas();