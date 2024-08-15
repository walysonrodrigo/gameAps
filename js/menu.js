const countries = [
    { name: 'Brasil', flag: 'flags/brasil.png', primaryColor: '#009739', secondaryColor: '#FFD700', tertiaryColor: '#002776' }, // Verde, Amarelo, Azul
    { name: 'Alemanha', flag: 'flags/alemanha.png', primaryColor: '#000000', secondaryColor: '#FF0000', tertiaryColor: '#FFCC00' }, // Preto, Vermelho, Amarelo
    { name: 'Itália', flag: 'flags/italia.png', primaryColor: '#009246', secondaryColor: '#FFFFFF', tertiaryColor: '#CE2B37' }, // Verde, Branco, Vermelho
    { name: 'Argentina', flag: 'flags/argentina.png', primaryColor: '#FFFFFF', secondaryColor: '#74ACDF', tertiaryColor: '#FFFFFF' }, // Azul Claro, Branco, Azul Claro
    { name: 'França', flag: 'flags/franca.png', primaryColor: '#0055A4', secondaryColor: '#FFFFFF', tertiaryColor: '#EF4135' }, // Azul Escuro, Branco, Vermelho
    { name: 'Uruguai', flag: 'flags/uruguai.png', primaryColor: '#FFFFFF', secondaryColor: '#74ACDF', tertiaryColor: '#FFFFFF' }, // Azul Claro, Branco, Azul Claro
    { name: 'Espanha', flag: 'flags/espanha.png', primaryColor: '#AA0000', secondaryColor: '#FFD700', tertiaryColor: '#AA0000' }, // Vermelho, Amarelo, Vermelho
    { name: 'Inglaterra', flag: 'flags/inglaterra.png', primaryColor: '#FFFFFF', secondaryColor: '#FF0000', tertiaryColor: '#FFFFFF' } // Branco, Vermelho, Branco
];

var matchCountry = [];

function loadCountryOptions() {
    const container = document.querySelector('.country-selection');
    countries.forEach(country => {
        const option = document.createElement('div');
        option.classList.add('country-option');
        option.innerHTML = `<img src="${country.flag}" alt="Bandeira do ${country.name}" onclick="startGame('${country.name.toLowerCase()}')">`;
        container.appendChild(option);
    });
}

function startGame(countryName) {
    const country = countries.find(c => c.name.toLowerCase() === countryName);
    matchCountry = [];

    if (country) {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'flex';
        setTorcidaColors(country.primaryColor, country.secondaryColor, country.tertiaryColor); // Cor terciária fixa como cinza
        init(); // Inicializa o jogo

        generateMatches(countryName); // Gera e exibe os confrontos com o país selecionado
    }
}

function setTorcidaColors(primaryColor, secondaryColor, tertiaryColor) {
    document.documentElement.style.setProperty('--seat-color', tertiaryColor);
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    document.documentElement.style.setProperty('--tertiary-color', tertiaryColor);
}

function loadFans() {
    // JavaScript para adicionar torcedores
    const torcida = document.getElementById('torcida');
    const numSeats = 40; // Número de assentos a serem exibidos

    for (let i = 0; i < numSeats; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        torcida.appendChild(seat);
    }
}

function generateMatches(selectedCountryName) {
    const matchesList = document.getElementById('matches-list');
    const selectedCountry = countries.find(c => c.name.toLowerCase() === selectedCountryName);
    const otherCountries = countries.filter(c => c.name.toLowerCase() !== selectedCountryName);

    // Sorteia um país aleatório para enfrentar o país selecionado
    const randomIndex = Math.floor(Math.random() * otherCountries.length);
    const randomCountry = otherCountries[randomIndex];

    matchesList.innerHTML = ''; // Limpa qualquer conteúdo anterior

    // Adiciona o confronto entre o país selecionado e o país sorteado
    const match = document.createElement('div');
    match.className = 'match';
    match.innerHTML = `
        <span class="team"><img src="${selectedCountry.flag}" alt="Bandeira do ${selectedCountry.name}" width="50" height="auto"></span>
        <span class="score" id="scorePlayer1">0</span>
        <span class="vs">x</span>
        <span class="score" id="scorePlayer2">0</span>
        <span class="team"><img src="${randomCountry.flag}" alt="Bandeira do ${randomCountry.name}" width="50" height="auto"></span>
    `;

    matchCountry.push(selectedCountry);
    matchCountry.push(randomCountry);

    matchesList.appendChild(match);
    // matchesList.insertBefore("title", matchesList.firstChild);
}


loadFans();
loadCountryOptions(); // Carrega as opções de países quando a página é carregada
