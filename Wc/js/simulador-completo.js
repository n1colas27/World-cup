const groups = [
    { key: 'A', teams: ['M\u00e9xico', '\u00c1frica do Sul', 'Coreia do Sul', 'Rep\u00fablica Tcheca'] },
    { key: 'B', teams: ['Canad\u00e1', 'B\u00f3snia e Herzegovina', 'Catar', 'Su\u00ed\u00e7a'] },
    { key: 'C', teams: ['Brasil', 'Marrocos', 'Haiti', 'Esc\u00f3cia'] },
    { key: 'D', teams: ['Estados Unidos', 'Paraguai', 'Austr\u00e1lia', 'Turquia'] },
    { key: 'E', teams: ['Alemanha', 'Cura\u00e7ao', 'Costa do Marfim', 'Equador'] },
    { key: 'F', teams: ['Holanda', 'Jap\u00e3o', 'Su\u00e9cia', 'Tun\u00edsia'] },
    { key: 'G', teams: ['B\u00e9lgica', 'Egito', 'Ir\u00e3', 'Nova Zel\u00e2ndia'] },
    { key: 'H', teams: ['Espanha', 'Cabo Verde', 'Ar\u00e1bia Saudita', 'Uruguai'] },
    { key: 'I', teams: ['Fran\u00e7a', 'Senegal', 'Iraque', 'Noruega'] },
    { key: 'J', teams: ['Argentina', 'Arg\u00e9lia', '\u00c1ustria', 'Jord\u00e2nia'] },
    { key: 'K', teams: ['Portugal', 'RD do Congo', 'Uzbequist\u00e3o', 'Col\u00f4mbia'] },
    { key: 'L', teams: ['Inglaterra', 'Cro\u00e1cia', 'Gana', 'Panam\u00e1'] }
];

const roundNames = ['Fase 32', 'Oitavas', 'Quartas', 'Semifinal', 'Final'];
let activeGroup = 'A';
let groupOrders = {};
let thirdQualified = {};
let knockoutRounds = [];

function resetOrders() {
    groupOrders = {};
    thirdQualified = {};
    groups.forEach(group => {
        groupOrders[group.key] = [group.teams[0], group.teams[1], group.teams[2], group.teams[3]];
        thirdQualified[group.key] = false;
    });
    knockoutRounds = [];
}

function getGroup(key) {
    return groups.find(group => group.key === key);
}

function getUsedThirdCount() {
    return Object.values(thirdQualified).filter(Boolean).length;
}

function syncFourth(groupKey) {
    const group = getGroup(groupKey);
    const selected = groupOrders[groupKey].slice(0, 3).filter(Boolean);
    groupOrders[groupKey][3] = group.teams.find(team => !selected.includes(team)) || group.teams[0];
}

function calculateTournament() {
    const tables = groups.map(group => ({
        key: group.key,
        table: groupOrders[group.key].map((name, index) => ({
            name,
            groupKey: group.key,
            position: index + 1,
            points: index === 0 ? 9 : index === 1 ? 6 : index === 2 ? 3 : 0,
            balance: 3 - index,
            goalsFor: 6 - index
        }))
    }));

    const direct = [];
    const selectedThirds = [];
    const allThirds = [];

    tables.forEach(groupTable => {
        direct.push(groupTable.table[0], groupTable.table[1]);
        allThirds.push(groupTable.table[2]);
        if (thirdQualified[groupTable.key]) selectedThirds.push(groupTable.table[2]);
    });

    return { tables, direct, allThirds, selectedThirds, qualified: [...direct, ...selectedThirds] };
}

function renderGroupTabs() {
    const tabs = document.getElementById('groupTabs');
    tabs.innerHTML = '';
    groups.forEach(group => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'group-tab' + (group.key === activeGroup ? ' active' : '');
        button.textContent = group.key;
        button.onclick = () => {
            activeGroup = group.key;
            renderSimulator();
        };
        tabs.appendChild(button);
    });
}

function renderMatches() {
    const group = getGroup(activeGroup);
    const grid = document.getElementById('matchGrid');
    const count = getUsedThirdCount();
    const checked = thirdQualified[group.key];
    const blocked = !checked && count >= 8;

    syncFourth(group.key);
    document.getElementById('activeGroupTitle').textContent = 'Grupo ' + group.key;
    grid.innerHTML = '';
    grid.className = 'bubble-picker';

    group.teams.forEach(team => {
        const position = groupOrders[group.key].indexOf(team);
        const row = document.createElement('div');
        row.className = 'bubble-team-row' + (position === 3 ? ' fourth' : '');
        row.innerHTML = '<strong>' + team + '</strong>';

        const controls = document.createElement('div');
        controls.className = 'bubble-controls';

        [0, 1, 2, 3].forEach(targetPosition => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'position-bubble' + (position === targetPosition ? ' active' : '') + (targetPosition === 3 ? ' auto' : '');
            button.textContent = String(targetPosition + 1);
            button.setAttribute('aria-label', team + ' em ' + (targetPosition + 1) + 'o');
            button.disabled = targetPosition === 3;
            button.onclick = () => {
                if (targetPosition === 3) return;
                const currentTeam = groupOrders[group.key][targetPosition];
                const currentPosition = groupOrders[group.key].indexOf(team);
                groupOrders[group.key][targetPosition] = team;
                if (currentPosition >= 0) groupOrders[group.key][currentPosition] = currentTeam;
                syncFourth(group.key);
                knockoutRounds = [];
                renderSimulator();
                setStatus(team + ' definido em ' + (targetPosition + 1) + 'o no Grupo ' + group.key + '.');
            };
            controls.appendChild(button);
        });

        row.appendChild(controls);
        grid.appendChild(row);
    });

    const thirdToggle = document.createElement('label');
    thirdToggle.className = 'third-toggle' + (blocked ? ' disabled' : '');
    thirdToggle.innerHTML = `
        <input type="checkbox" ${checked ? 'checked' : ''} ${blocked ? 'disabled' : ''}>
        <span>3o deste grupo classifica</span>
        <strong>${count}/8</strong>
    `;
    thirdToggle.querySelector('input').addEventListener('change', event => {
        thirdQualified[group.key] = event.target.checked;
        knockoutRounds = [];
        renderSimulator();
        setStatus(getUsedThirdCount() + ' de 8 terceiros classificados selecionados.');
    });
    grid.appendChild(thirdToggle);
}

function renderStandings() {
    const table = calculateTournament().tables.find(group => group.key === activeGroup).table;
    const standings = document.getElementById('groupStandings');
    standings.innerHTML = '';

    table.forEach(team => {
        const row = document.createElement('div');
        row.className = 'compact-standing-row ' + (team.position < 3 ? 'qualified' : team.position === 3 ? 'third' : '');
        row.innerHTML = `
            <span class="standing-pos">${team.position}</span>
            <span class="standing-team">${team.name}</span>
            <span>${team.position < 3 ? 'OK' : team.position === 3 ? '3o' : '-'}</span>
            <span></span>
            <span></span>
        `;
        standings.appendChild(row);
    });
}

function renderThirds() {
    const { allThirds } = calculateTournament();
    const grid = document.getElementById('thirdsGrid');
    grid.innerHTML = '';

    allThirds.forEach((team, index) => {
        const selected = thirdQualified[team.groupKey];
        const blocked = !selected && getUsedThirdCount() >= 8;
        const item = document.createElement('div');
        item.className = 'third-card ' + (selected ? 'qualified' : '');
        item.innerHTML = `
            <span>${index + 1}</span>
            <strong>${team.name}</strong>
            <small>Grupo ${team.groupKey}</small>
        `;
        item.onclick = () => {
            if (blocked) {
                setStatus('Limite atingido: apenas 8 terceiros podem entrar na fase de 32.');
                return;
            }
            thirdQualified[team.groupKey] = !thirdQualified[team.groupKey];
            knockoutRounds = [];
            renderSimulator();
            setStatus(getUsedThirdCount() + ' de 8 terceiros classificados selecionados.');
        };
        grid.appendChild(item);
    });
}

function seedQualified(qualified) {
    const top = qualified.slice(0, 16);
    const bottom = qualified.slice(16).reverse();
    return top.map((team, index) => ({
        home: team.name,
        away: bottom[index] ? bottom[index].name : null,
        winner: null
    }));
}

function createNextRound(previousRound) {
    const matches = [];
    for (let i = 0; i < previousRound.length; i += 2) {
        matches.push({
            home: previousRound[i].winner || null,
            away: previousRound[i + 1] ? previousRound[i + 1].winner || null : null,
            winner: null
        });
    }
    return matches;
}

function rebuildFutureRounds(fromRound) {
    for (let round = fromRound + 1; round < knockoutRounds.length; round += 1) {
        knockoutRounds[round] = createNextRound(knockoutRounds[round - 1]);
    }
}

function buildKnockout() {
    const result = calculateTournament();
    if (result.selectedThirds.length !== 8) {
        setStatus('Selecione exatamente 8 terceiros classificados para formar a fase de 32.');
        return;
    }

    knockoutRounds = [seedQualified(result.qualified)];
    while (knockoutRounds[knockoutRounds.length - 1].length > 1) {
        knockoutRounds.push(createNextRound(knockoutRounds[knockoutRounds.length - 1]));
    }

    renderBracket();
    setStatus('Mata-mata gerado com 32 selecoes.');
}

function renderBracket() {
    const container = document.getElementById('bracketGrid');
    container.innerHTML = '';

    if (!knockoutRounds.length) {
        container.innerHTML = '<div class="empty-bracket">Selecione 8 terceiros e gere o mata-mata.</div>';
        return;
    }

    knockoutRounds.forEach((round, roundIndex) => {
        const column = document.createElement('div');
        column.className = 'bracket-round';
        column.innerHTML = '<p class="bracket-round-title">' + roundNames[roundIndex] + '</p>';

        round.forEach((match, matchIndex) => {
            const card = document.createElement('div');
            card.className = 'bracket-match';
            [match.home, match.away].forEach(team => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'bracket-team' + (match.winner === team ? ' selected' : '');
                button.textContent = team || 'A definir';
                button.disabled = !team;
                button.onclick = () => pickWinner(roundIndex, matchIndex, team);
                card.appendChild(button);
            });
            column.appendChild(card);
        });

        container.appendChild(column);
    });
}

function pickWinner(roundIndex, matchIndex, team) {
    knockoutRounds[roundIndex][matchIndex].winner = team;
    rebuildFutureRounds(roundIndex);
    renderBracket();

    const final = knockoutRounds[knockoutRounds.length - 1][0];
    if (final && final.winner) setStatus('Campeao simulado: ' + final.winner + '.');
}

function shuffle(items) {
    return items.slice().sort(() => Math.random() - 0.5);
}

function simulateActiveGroup() {
    groupOrders[activeGroup] = shuffle(getGroup(activeGroup).teams);
    knockoutRounds = [];
    renderSimulator();
    setStatus('Grupo ' + activeGroup + ' sorteado.');
}

function simulateGroups() {
    groups.forEach(group => {
        groupOrders[group.key] = shuffle(group.teams);
        thirdQualified[group.key] = false;
    });
    shuffle(groups.map(group => group.key)).slice(0, 8).forEach(key => {
        thirdQualified[key] = true;
    });
    knockoutRounds = [];
    renderSimulator();
    setStatus('Grupos sorteados e 8 terceiros selecionados.');
}

function randomWinner(match) {
    if (!match.home) return match.away;
    if (!match.away) return match.home;
    return Math.random() > 0.5 ? match.home : match.away;
}

function simulateCup() {
    if (getUsedThirdCount() !== 8) simulateGroups();
    buildKnockout();

    knockoutRounds.forEach((round, roundIndex) => {
        round.forEach((match, matchIndex) => {
            knockoutRounds[roundIndex][matchIndex].winner = randomWinner(match);
        });
        rebuildFutureRounds(roundIndex);
    });

    renderBracket();
    const champion = knockoutRounds[knockoutRounds.length - 1][0].winner;
    setStatus('Campeao simulado: ' + champion + '.');
}

function renderResultsOnly() {
    renderStandings();
    renderThirds();
    renderBracket();
}

function renderSimulator() {
    renderGroupTabs();
    renderMatches();
    renderResultsOnly();
}

function setStatus(message) {
    const status = document.getElementById('tournamentStatus');
    if (status) status.textContent = message;
}

function resetSimulator() {
    resetOrders();
    activeGroup = 'A';
    renderSimulator();
    setStatus('Simulador limpo. Escolha 1o, 2o, 3o e marque exatamente 8 terceiros.');
}

document.addEventListener('DOMContentLoaded', () => {
    resetOrders();
    renderSimulator();
});

