// Elementos
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

let modoAtual = 'random';
let cacheDaily = null;

const API_BASE = 'https://api-charada-backend.vercel.app/charadas/aleatoria';

function getDataHoje() {
    return new Date().toISOString().split('T')[0];
}

async function fetchCharada() {
    try {
        const res = await fetch(API_BASE);
        const data = await res.json();
        return { 
            pergunta: data.pergunta || "O que é, o que é? 🤔", 
            resposta: data.resposta || "Mistério..." 
        };
    } catch {
        return { pergunta: "Ops! Sem conexão.", resposta: "Tente novamente." };
    }
}

async function carregarModo(modo) {
    modoAtual = modo;
    
    // UI Feedback
    btnModeDaily.classList.toggle('active', modo === 'daily');
    btnModeRandom.classList.toggle('active', modo === 'random');
    cardInner.classList.remove('flipped');

    if (modo === 'daily') {
        badgeTipo.textContent = "📅 Charada do Dia";
        btnIcon.textContent = "✨";
        btnText.textContent = "Ver a de Hoje";
        
        const hoje = getDataHoje();
        const stored = localStorage.getItem('daily_charada');
        const storedDate = localStorage.getItem('daily_date');

        if (stored && storedDate === hoje) {
            cacheDaily = JSON.parse(stored);
        } else {
            cacheDaily = await fetchCharada();
            localStorage.setItem('daily_charada', JSON.stringify(cacheDaily));
            localStorage.setItem('daily_date', hoje);
        }
        exibir(cacheDaily);
        infoText.textContent = "📅 Esta charada é exclusiva para hoje!";
    } else {
        badgeTipo.textContent = "🎲 Pergunta Aleatória";
        btnIcon.textContent = "🎲";
        btnText.textContent = "Nova Charada";
        const nova = await fetchCharada();
        exibir(nova);
        infoText.textContent = "🎲 Cada clique traz um desafio diferente!";
    }
}

function exibir(charada) {
    campoPergunta.textContent = charada.pergunta;
    campoResposta.textContent = charada.resposta;
}

// Eventos
cardInner.addEventListener('click', () => cardInner.classList.toggle('flipped'));

btnNova.addEventListener('click', async () => {
    if (modoAtual === 'random') {
        const n = await fetchCharada();
        exibir(n);
        cardInner.classList.remove('flipped');
    } else {
        // No modo diário, apenas garante que voltou para a frente
        cardInner.classList.remove('flipped');
    }
});

btnModeDaily.addEventListener('click', () => carregarModo('daily'));
btnModeRandom.addEventListener('click', () => carregarModo('random'));

// Início
carregarModo('random');