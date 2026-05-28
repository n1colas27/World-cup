/* ============================================
   MAIN JAVASCRIPT - Copa do Mundo 2026
   ============================================ */

// Navigation
function navigateTo(page) {
    window.location.href = page;
}

// Mobile menu
function toggleMobileMenu() {
    const menu = document.querySelector('.navbar-menu');
    if (menu) menu.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', function () {
    // Mobile dropdown toggle
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                const dropdown = this.closest('.nav-dropdown');
                if (dropdown) dropdown.classList.toggle('active');
            }
        });
    }

    // Close mobile menu on outside click
    document.addEventListener('click', function (e) {
        const navbar = document.querySelector('.navbar');
        if (navbar && !navbar.contains(e.target)) {
            const menu = document.querySelector('.navbar-menu');
            if (menu) menu.classList.remove('active');
        }
    });

    // Animate elements on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(el => {
            if (el.isIntersecting) {
                el.target.style.animationPlayState = 'running';
                observer.unobserve(el.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-up').forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });

    initHomeInteractions();
});

function initHomeInteractions() {
    let progress = document.getElementById('scrollProgress');
    if (!progress) {
        progress = document.createElement('div');
        progress.className = 'scroll-progress';
        progress.id = 'scrollProgress';
        document.body.prepend(progress);
    }

    if (!document.querySelector('.page-light')) {
        const light = document.createElement('div');
        light.className = 'page-light';
        document.body.prepend(light);
    }

    if (progress) {
        window.addEventListener('scroll', function () {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
            progress.style.width = percent + '%';
        });
    }

    document.addEventListener('mousemove', function (event) {
        document.documentElement.style.setProperty('--mouse-x', event.clientX + 'px');
        document.documentElement.style.setProperty('--mouse-y', event.clientY + 'px');
    });

    initCountdown();
    initCounters();
    initPageDeepContent();
    initTiltCards();
}

function initCountdown() {
    const panel = document.querySelector('[data-countdown]');
    if (!panel) return;

    const targetDate = new Date(panel.dataset.countdown).getTime();
    const units = {
        days: panel.querySelector('[data-unit="days"]'),
        hours: panel.querySelector('[data-unit="hours"]'),
        minutes: panel.querySelector('[data-unit="minutes"]'),
        seconds: panel.querySelector('[data-unit="seconds"]')
    };

    function updateCountdown() {
        const distance = Math.max(targetDate - Date.now(), 0);
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / (1000 * 60)) % 60);
        const seconds = Math.floor((distance / 1000) % 60);

        if (units.days) units.days.textContent = days;
        if (units.hours) units.hours.textContent = String(hours).padStart(2, '0');
        if (units.minutes) units.minutes.textContent = String(minutes).padStart(2, '0');
        if (units.seconds) units.seconds.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || entry.target.dataset.done === 'true') return;

            const element = entry.target;
            const target = Number(element.dataset.counter);
            const duration = 900;
            const start = performance.now();

            function tick(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                element.textContent = Math.round(target * eased);
                if (progress < 1) requestAnimationFrame(tick);
            }

            element.dataset.done = 'true';
            requestAnimationFrame(tick);
        });
    }, { threshold: 0.35 });

    counters.forEach(counter => counterObserver.observe(counter));
}

function initTiltCards() {
    document.querySelectorAll('.ranking-item, .scorer-card, .record-card, .stat-card, .player-card, .kit-card, .lineup-player').forEach(card => {
        if (!card.hasAttribute('data-tilt')) card.setAttribute('data-tilt', '');
    });

    const cards = document.querySelectorAll('[data-tilt]');
    if (!cards.length) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', function (event) {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const rotateY = ((x / rect.width) - 0.5) * 8;
            const rotateX = ((y / rect.height) - 0.5) * -8;
            card.style.transform = 'perspective(900px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
        });
    });
}

function initPageDeepContent() {
    if (document.querySelector('.deep-content-section')) return;
    if (document.body.className.indexOf('theme-') >= 0) return;

    const path = window.location.pathname;
    const main = document.querySelector('main');
    if (!main) return;

    const data = (path.endsWith('/') || path.indexOf('index.html') >= 0 || path.endsWith('/Wc')) ? {
        title: 'Mapa do Site',
        subtitle: 'A Home concentra o panorama geral, mas cada área aprofunda um pedaço diferente da Copa.',
        cards: [
            ['Sedes', 'Entenda por que Canadá, México e Estados Unidos tornam 2026 uma Copa de escala continental.'],
            ['Seleções', 'Use o menu para ver identidade, história, elenco provável e cultura de cada país trabalhado.'],
            ['Recordes', 'Veja marcas históricas e como o formato ampliado pode criar novos recordes.'],
            ['Simulador', 'Teste grupos, melhores terceiros e mata-mata para montar uma Copa completa.']
        ]
    } : path.indexOf('historia.html') >= 0 ? {
        title: 'Guia de Estudo',
        subtitle: 'Conteúdos extras para transformar a página em material de consulta.',
        cards: [
            ['Origem', 'A Copa surge para reunir seleções nacionais em uma competição própria, independente dos Jogos Olímpicos.'],
            ['Crescimento', 'O torneio deixou de ser pequeno e passou a receber mais continentes, mais mídia e mais impacto econômico.'],
            ['Memória', 'Cada edição cria jogos, gols, personagens e histórias que continuam sendo lembrados décadas depois.'],
            ['Debate', 'A Copa também abre discussões sobre tecnologia, arbitragem, política, turismo e identidade nacional.']
        ]
    } : path.indexOf('copa-2026.html') >= 0 ? {
        title: 'Guia da Edição 2026',
        subtitle: 'O que torna esta Copa diferente das anteriores.',
        cards: [
            ['Expansão', 'A entrada de 48 seleções muda o equilíbrio competitivo e aumenta a chance de estreantes e surpresas.'],
            ['Logística', 'Três países-sede significam viagens longas, fusos diferentes e planejamento físico mais importante.'],
            ['Mata-mata maior', 'A fase eliminatória começa com 32 equipes, criando uma rodada decisiva a mais.'],
            ['Impacto', 'Mais jogos também significam mais turismo, audiência, venda de ingressos e conteúdo para torcedores.']
        ]
    } : path.indexOf('simulador.html') >= 0 ? {
        title: 'Como Ler a Simulação',
        subtitle: 'Use os resultados como exercício para entender pontuação e cenários de classificação.',
        cards: [
            ['Cenário seguro', 'Normalmente 6 pontos deixam uma seleção muito próxima da classificação.'],
            ['Empates', 'Muitos empates embolam o grupo e aumentam a importância do saldo de gols.'],
            ['Saldo', 'Goleadas podem mudar a tabela mesmo quando duas seleções têm a mesma pontuação.'],
            ['Terceiros', 'Em 2026, uma terceira colocada ainda pode avançar se tiver campanha suficiente.']
        ]
    } : path.indexOf('recordes.html') >= 0 ? {
        title: 'Laboratório de Recordes',
        subtitle: 'A edição de 2026 pode alterar várias marcas por causa do novo número de partidas.',
        cards: [
            ['Mais jogos', 'Com 104 partidas, há mais espaço para gols, assistências e recordes coletivos.'],
            ['Artilharia', 'Finalistas farão mais jogos que em formatos antigos, aumentando chances de marcas individuais.'],
            ['Participações', 'Seleções tradicionais podem ampliar vantagem em presença histórica.'],
            ['Novas histórias', 'Países estreantes ou retornando ao torneio podem criar recordes próprios.']
        ]
    } : null;

    if (!data) return;

    const section = document.createElement('section');
    section.className = 'deep-content-section animate-up';
    section.innerHTML =
        '<div class="deep-content-header"><p class="section-title">' + data.title + '</p><p>' + data.subtitle + '</p></div>' +
        '<div class="deep-content-grid">' +
            data.cards.map(card => '<div class="deep-content-card" data-tilt><p>' + card[0] + '</p><span>' + card[1] + '</span></div>').join('') +
        '</div>';

    const footer = document.querySelector('footer');
    if (footer) main.appendChild(section);
}



