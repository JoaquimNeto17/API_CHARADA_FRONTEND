// ==================== ELEMENTOS DOM ====================
const cardInner = document.getElementById('cardInner');
const campoPergunta = document.getElementById('pergunta');
const campoResposta = document.getElementById('resposta');
const btnNova = document.getElementById('btnNova');
const btnModeDaily = document.getElementById('btnModeDaily');
const btnModeRandom = document.getElementById('btnModeRandom');
const btnIcon = document.getElementById('btnIcon');
const btnText = document.getElementById('btnText');
const infoText = document.getElementById('infoText');
const badgeTipo = document.getElementById('badgeTipo');

// ==================== ESTADO GLOBAL ====================
let modoAtual = 'random';
let ultimaCharadaDaily = null;
let dataAtualCache = null;

// API endpoint
const API_BASE = 'https://api-charada-backend.vercel.app/charadas/aleatoria';

// ==================== DATA ATUAL (YYYY-MM-DD) ====================
function getDataHoje() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`;
}

// ==================== BUSCAR CHARADA ALEATÓRIA ====================
async function buscarCharadaAleatoria() {
    try {
        campoPergunta.textContent = "⏳ buscando...";
        campoResposta.textContent = "";
        
        const response = await fetch(API_BASE);
        const dados = await response.json();
        
        const pergunta = dados.pergunta || "O que é, o que é? 🤔";
        const resposta = dados.resposta || "Mistério profundo demais...";
        
        return { pergunta, resposta };
    } catch (error) {
        console.error("Erro:", error);
        return {
            pergunta: "🔌 Sem conexão",
            resposta: "Tente novamente mais tarde"
        };
    }
}

// ==================== CHARADA DO DIA (com localStorage) ====================
async function buscarCharadaDoDia() {
    const hoje = getDataHoje();
    
    // Cache em memória
    if (ultimaCharadaDaily && dataAtualCache === hoje) {
        return ultimaCharadaDaily;
    }
    
    // Verifica localStorage
    const stored = localStorage.getItem('charada_daily');
    const storedDate = localStorage.getItem('charada_daily_date');
    
    if (stored && storedDate === hoje) {
        try {
            const parsed = JSON.parse(stored);
            ultimaCharadaDaily = parsed;
            dataAtualCache = hoje;
            return parsed;
        } catch(e) {}
    }
    
    // Gera nova charada para o dia
    const novaCharada = await buscarCharadaAleatoria();
    ultimaCharadaDaily = novaCharada;
    dataAtualCache = hoje;
    localStorage.setItem('charada_daily', JSON.stringify(novaCharada));
    localStorage.setItem('charada_daily_date', hoje);
    
    return novaCharada;
}

// ==================== ATUALIZAR UI ====================
function atualizarUI(charada) {
    campoPergunta.textContent = charada.pergunta;
    campoResposta.textContent = charada.resposta;
    
    // Reseta o card para a frente
    if (cardInner.classList.contains('flipped')) {
        cardInner.classList.remove('flipped');
    }
}

// ==================== CARREGAR CONTEÚDO POR MODO ====================
async function carregarCharada() {
    if (modoAtual === 'daily') {
        badgeTipo.textContent = "📅 charada do dia";
        const charada = await buscarCharadaDoDia();
        atualizarUI(charada);
        infoText.innerHTML = "📅 Charada fixa por 24h — só muda amanhã!";
        btnIcon.textContent = "📅";
        btnText.textContent = "Charada do Dia";
    } else {
        badgeTipo.textContent = "🎲 pergunta aleatória";
        const charada = await buscarCharadaAleatoria();
        atualizarUI(charada);
        infoText.innerHTML = "🎲 Modo aleatório — cada clique traz uma surpresa!";
        btnIcon.textContent = "🎲";
        btnText.textContent = "Nova Charada";
    }
}

// ==================== AÇÃO DO BOTÃO PRINCIPAL ====================
async function acaoBotao() {
    if (modoAtual === 'daily') {
        const charada = await buscarCharadaDoDia();
        atualizarUI(charada);
        infoText.innerHTML = "📅 A mesma charada do dia! (renova amanhã)";
        setTimeout(() => {
            if (modoAtual === 'daily') infoText.innerHTML = "📅 Charada fixa por 24h";
        }, 2000);
    } else {
        const novaCharada = await buscarCharadaAleatoria();
        atualizarUI(novaCharada);
        infoText.innerHTML = "🎲 Nova charada!";
        setTimeout(() => {
            if (modoAtual === 'random') infoText.innerHTML = "🎲 Modo aleatório ativo";
        }, 1800);
    }
}

// ==================== ALTERNAR MODO ====================
function setModo(modo) {
    modoAtual = modo;
    
    if (modo === 'daily') {
        btnModeDaily.classList.add('active');
        btnModeRandom.classList.remove('active');
    } else {
        btnModeRandom.classList.add('active');
        btnModeDaily.classList.remove('active');
    }
    
    carregarCharada();
}

// ==================== EVENTOS ====================
// Virar o card
cardInner.addEventListener('click', () => {
    cardInner.classList.toggle('flipped');
});

// Botão principal
btnNova.addEventListener('click', acaoBotao);

// Botões de modo
btnModeDaily.addEventListener('click', () => {
    if (modoAtual !== 'daily') setModo('daily');
    else carregarCharada();
});

btnModeRandom.addEventListener('click', () => {
    if (modoAtual !== 'random') setModo('random');
});

// ==================== INICIALIZAÇÃO ====================
async function init() {
    modoAtual = 'random';
    btnModeRandom.classList.add('active');
    badgeTipo.textContent = "🎲 pergunta aleatória";
    
    const primeiraCharada = await buscarCharadaAleatoria();
    atualizarUI(primeiraCharada);
    infoText.innerHTML = "🎲 Modo aleatório ativo • clique no card para virar";
    
    // Pré-carrega charada do dia em background
    buscarCharadaDoDia().catch(e => console.warn(e));
}

init();