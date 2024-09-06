const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const intensityCanvas = document.getElementById('intensityCanvas');
const intensityCtx = intensityCanvas.getContext('2d');
const directionCanvas = document.getElementById('directionCanvas');
const directionCtx = directionCanvas.getContext('2d');

let playerScore = 0; // Posição inicial do goleiro no eixo Y
let goalkeeperMoving = false;
let shotIntensity = 5;
let shotDirection = 250; // Centralizado no canvas de direção
let intensityIncreasing = true;
let directionMovingRight = true;
let goalkeeperDirectionX = 'right'; // Direção inicial do goleiro no eixo X
let goalkeeperDirectionY = 'down'; // Direção inicial do goleiro no eixo Y
let intensityAnimationId;
let directionAnimationId;
let ballX = 400; // Posição inicial da bola
let ballY = 300; // Posição inicial da bola
let shooting = false; // Estado para controle do chute

// Tamanho do gol
const goalWidth = 300;
const goalHeight = 130;
const goalX = (canvas.width - goalWidth) / 2; // Centralizar horizontalmente
const goalY = 50; // Posição vertical do gol

// Parte interna do gol
const goalInsideWidth = 280;
const goalInsideHeight = 120;
const goalInsideX = goalX + 10; // Centralizar horizontalmente
const goalInsideY = goalY + 10; // Ajustar a posição vertical

// Tamanho da bola
const ballRadius = 10;

// Tamanho do goleiro
const goalkeeperWidth = 120;
const goalkeeperHeight = 30;
let goalkeeperX = 360; // Posição inicial do goleiro no eixo X
let goalkeeperY = goalY + goalHeight - goalkeeperHeight;
let goalkeeperInterval;

// Indica se o goleiro está tentando defender
let goalieDefending = false;


// Espaço adicional fora do gol
const additionalSpace = 50;

// Variáveis para o placar
let currentPlayer = 1; // Jogador inicial

let player1Score = 0;
let player2Score = 0;

let player1Penalties = [];
let player2Penalties = [];

// Desenhar o campo e o gol
function drawField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#6ab150';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gol
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(goalX, goalY, goalWidth, goalHeight);

    // Parte interna do gol
    ctx.fillStyle = '#6AB150';
    ctx.fillRect(goalInsideX, goalInsideY, goalInsideWidth, goalInsideHeight);
}

// Desenhar a bola
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.closePath();
}

// Desenhar o goleiro
function drawGoalkeeper() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(goalkeeperX, goalkeeperY, goalkeeperWidth, goalkeeperHeight);
}

function animateGoalkeeper() {
    if (goalkeeperInterval) {
        clearInterval(goalkeeperInterval); // Limpa o intervalo anterior, se houver
    }

    goalkeeperMoving = true;

    goalkeeperInterval = setInterval(() => {
        if (!goalieDefending) { // Apenas move o goleiro se ele não estiver defendendo
            // Movimento no eixo X
            if (goalkeeperDirectionX === 'right') {
                goalkeeperX += 10; // Velocidade constante
                if (goalkeeperX >= goalX + goalWidth - goalkeeperWidth) { // Limite à direita do gol
                    goalkeeperDirectionX = 'left';
                }
            } else {
                goalkeeperX -= 10; // Velocidade constante
                if (goalkeeperX <= goalX) { // Limite à esquerda do gol
                    goalkeeperDirectionX = 'right';
                }
            }
        }

        drawField();
        drawGoalkeeper();
        drawBall();
    }, 100); // Intervalo constante para manter a velocidade do goleiro
}


function checkGoal() {
    const goalArea = {
        x: goalX,
        y: goalY,
        width: goalWidth,
        height: goalHeight
    };

    const insideGoal = isBallInsideGoal(ballX, ballY, ballRadius, goalArea);

    if (insideGoal) {
        if (currentPlayer === 1) {
            player1Score++;
            updateScore(player1Score, 1);
            updatePenalty(1, true);
        } else {
            player2Score++;
            updateScore(player2Score, 2);
            updatePenalty(2, true);
        }
        animateText("GOL!", 'green', restartGame);
        return;
    }

    if (currentPlayer === 1) {
        updatePenalty(1, false);
    } else {
        updatePenalty(2, false);
    }

    animateText("PERDEU!", 'red', restartGame);
}

function isBallInsideGoal(ballX, ballY, ballRadius, goalArea) {
    // Verifica se o centro da bola está dentro dos limites da área do gol
    const isInsideHorizontally = ballX - ballRadius >= goalArea.x && ballX + ballRadius <= goalArea.x + goalArea.width;
    const isInsideVertically = ballY - ballRadius >= goalArea.y && ballY + ballRadius <= goalArea.y + goalArea.height;

    return isInsideHorizontally && isInsideVertically;
}

// Função para calcular a posição inicial para o ricocheteio
function calculateRicochetTarget(startX, startY, hitOnGoalPost) {
    // Se bateu na trave, pode voltar um pouco mais para simular um ricocheteio realista
    const ricochetDistance = hitOnGoalPost ? 30 : 0; // Ajuste a distância conforme necessário

    // Define o alvo de retorno dependendo do impacto
    const targetX = startX - ricochetDistance;
    const targetY = startY + ricochetDistance;

    return { targetX, targetY };
}

// Função para animar texto com efeitos visuais
function animateText(message, color, callback) {
    const messageDuration = 2000; // Duração total da animação em milissegundos
    const numSteps = 30; // Número de passos para a animação
    const intervalTime = messageDuration / numSteps; // Intervalo entre atualizações
    const startTime = Date.now(); // Tempo de início da animação

    function textStep() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / messageDuration, 1); // Progresso da animação
        const scale = 1 + 0.5 * progress; // Escala do texto

        // Configura o estilo do texto
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
        drawField(); // Redesenhar o campo
        drawGoalkeeper(); // Redesenhar o goleiro
        drawBall(); // Redesenhar a bola

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2); // Centraliza o texto
        ctx.scale(scale, scale); // Aplica a escala
        ctx.translate(-canvas.width / 2, -canvas.height / 2); // Reverte a centralização

        // Configura gradiente de cor
        const gradient = ctx.createLinearGradient(canvas.width / 2 - 100, canvas.height / 2 - 20, canvas.width / 2 + 100, canvas.height / 2 + 20);
        gradient.addColorStop(0, 'yellow');
        gradient.addColorStop(1, color);

        ctx.fillStyle = gradient;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Adiciona sombra ao texto
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        ctx.fillText(message, canvas.width / 2, canvas.height / 2); // Desenha o texto

        ctx.restore();

        // Continua a animação até o final
        if (progress < 1) {
            requestAnimationFrame(textStep);
        } else if (callback) {
            setTimeout(callback, 500); // Espera um pouco antes de chamar a função de reinício
        }
    }

    requestAnimationFrame(textStep);
}


// Função para atualizar o placar com animação
function updateScore(newScore, player) {
    const scoreElement = document.getElementById(`scorePlayer${player}`);
    let currentScore = parseInt(scoreElement.innerText);
    let increment = (newScore - currentScore) / 10;

    function animate() {
        if (Math.abs(newScore - currentScore) <= Math.abs(increment)) {
            scoreElement.innerText = newScore;
        } else {
            currentScore += increment;
            scoreElement.innerText = Math.round(currentScore);
            requestAnimationFrame(animate);
        }
    }

    animate();
}

// Animação da intensidade
function animateIntensity() {
    intensityCtx.clearRect(0, 0, intensityCanvas.width, intensityCanvas.height);

    // Barra de intensidade
    intensityCtx.fillStyle = '#FF0000';
    intensityCtx.fillRect(0, 0, Math.min(shotIntensity * 30, intensityCanvas.width), 50); // Ajustar a largura para não exceder o canvas

    // Controle automático da intensidade
    if (intensityIncreasing) {
        shotIntensity += 0.2;
        if (shotIntensity >= 10) {
            intensityIncreasing = false;
        }
    } else {
        shotIntensity -= 0.2;
        if (shotIntensity <= 1) {
            intensityIncreasing = true;
        }
    }

    intensityAnimationId = requestAnimationFrame(animateIntensity);
}

// Animação da direção
function animateDirection() {
    directionCtx.clearRect(0, 0, directionCanvas.width, directionCanvas.height);

    // Indicador de direção
    directionCtx.fillStyle = '#0000FF';
    directionCtx.fillRect(shotDirection - 5, 0, 10, directionCanvas.height); // Ajustar a altura para o canvas de direção

    // Controle automático da direção
    if (directionMovingRight) {
        shotDirection += 5; // Ajustar a velocidade para balancear a sensibilidade
        if (shotDirection >= directionCanvas.width - 5) { // Limite direito
            directionMovingRight = false;
        }
    } else {
        shotDirection -= 5; // Ajustar a velocidade para balancear a sensibilidade
        if (shotDirection <= 5) { // Limite esquerdo
            directionMovingRight = true;
        }
    }

    directionAnimationId = requestAnimationFrame(animateDirection);
}

// Animação da bola até o gol
function animateBall(targetX, targetY) {
    shooting = true;

    goalkeeperMoving = false; // Pausa o movimento do goleiro durante o chute
    goalieDefending = true;

    // Verificar se a bola passa pelo goleiro antes de iniciar o movimento
    const B0 = { x: ballX, y: ballY };
    const Bf = { x: targetX, y: targetY };
    const G0 = { x: goalkeeperX, y: goalkeeperY };
    const Gf = { x: goalkeeperX + 120, y: goalkeeperY };

    const ballWillPassGoalkeeper = verificarIntersecaoReta(B0, Bf, G0, Gf);

    if (ballWillPassGoalkeeper) {
        // Verifique se a posição y da bola coincide com a do goleiro
        const yNearGoalkeeper = targetY >= goalkeeperY && targetY <= goalkeeperY + goalkeeperHeight;

        if (yNearGoalkeeper) {
            // Se o goleiro está no caminho, marque como defesa
            ballX = goalkeeperX; // Posicione a bola na posição x do goleiro
            ballY = goalkeeperY + goalkeeperHeight / 2; // Posicione a bola na altura do goleiro
            animateText("DEFENDEU!", 'blue', restartGame);
            shooting = false;
            goalkeeperMoving = true; // Retoma o movimento do goleiro após o chute
            goalieDefending = false; // Reseta o estado de defesa

            if (currentPlayer === 1) {
                updatePenalty(1, false);
            } else {
                updatePenalty(2, false);
            }

            return; // Para a animação aqui
        }
    }

    const interval = setInterval(() => {
        const dx = (targetX - ballX) * 0.1;
        const dy = (targetY - ballY) * 0.1;

        ballX += dx;
        ballY += dy;

        drawField();
        drawGoalkeeper();
        drawBall();

        // Verificação de colisão com o goleiro
        const ballCollidesWithGoalkeeper = ballX + ballRadius >= goalkeeperX &&
            ballX - ballRadius <= goalkeeperX + goalkeeperWidth &&
            ballY + ballRadius >= goalkeeperY &&
            ballY - ballRadius <= goalkeeperY + goalkeeperHeight;

        if (ballCollidesWithGoalkeeper) {
            clearInterval(interval);
            animateText("DEFENDEU!", 'blue', restartGame);
            shooting = false;
            goalkeeperMoving = true; // Retoma o movimento do goleiro após o chute
            goalieDefending = false; // Reseta o estado de defesa

            if (currentPlayer === 1) {
                updatePenalty(1, false);
            } else {
                updatePenalty(2, false);
            }
        }

        if (Math.abs(ballX - targetX) <= 5 && Math.abs(ballY - targetY) <= 5) {
            clearInterval(interval);
            shooting = false;
            checkGoal();
            goalkeeperMoving = true; // Retoma o movimento do goleiro após o chute
            goalieDefending = false; // Reseta o estado de defesa
        }
    }, 50);
}
// Reiniciar o jogo
function restartGame() {
    goalkeeperX = goalX + (goalWidth - goalkeeperWidth) / 2;
    ballX = 400;
    ballY = 300;
    shotIntensity = 5;
    shotDirection = 250;

    drawField();
    drawGoalkeeper();
    drawBall();

    // Alternar para o próximo jogador
    currentPlayer = currentPlayer === 1 ? 2 : 1;

    if (currentPlayer == 1) {
        country = matchCountry[0];
        setTorcidaColors(country.primaryColor, country.secondaryColor, country.tertiaryColor);
    } else {
        country = matchCountry[1];
        setTorcidaColors(country.primaryColor, country.secondaryColor, country.tertiaryColor);
    }

    cancelAnimationFrame(intensityAnimationId);
    cancelAnimationFrame(directionAnimationId);

    intensityCtx.clearRect(0, 0, intensityCanvas.width, intensityCanvas.height);
    directionCtx.clearRect(0, 0, directionCanvas.width, directionCanvas.height);

    animateIntensity();
    animateDirection();
}

// Simular o chute
function shoot() {
    if (shooting) return; // Não permitir chute se já estiver atirando

    // Parar as animações dos gráficos imediatamente ao chutar
    cancelAnimationFrame(intensityAnimationId);
    cancelAnimationFrame(directionAnimationId);
    intensityCtx.clearRect(0, 0, intensityCanvas.width, intensityCanvas.height);
    directionCtx.clearRect(0, 0, directionCanvas.width, directionCanvas.height);

    // Calcular a posição final da bola com base na direção e intensidade
    const directionRatio = (shotDirection - 5) / (directionCanvas.width - 10); // Ajustar o cálculo da direção
    const targetX = goalX + (directionRatio * (goalWidth + 2 * additionalSpace)) - additionalSpace; // Ajustar direção para permitir espaço adicional
    const targetY = goalY + goalHeight - (shotIntensity * 10) + 10; // Ajustar a altura baseada na intensidade

    // // Restringir a posição X da bola dentro dos limites do campo com espaço adicional
    const constrainedTargetX = Math.min(Math.max(targetX, goalX - additionalSpace), goalX + goalWidth + additionalSpace);

    // // Iniciar a animação da bola
    animateBall(constrainedTargetX, targetY);

    // // Iniciar o movimento do goleiro
    animateGoalkeeper();
}

function updatePenalty(player, isGoal) {
    let penaltyElement;

    if (player == 1) {
        penaltyElement = document.getElementById(`penaltyPlayer${player}_${player1Penalties.length + 1}`);
        player1Penalties.push(isGoal);
    } else {
        penaltyElement = document.getElementById(`penaltyPlayer${player}_${player2Penalties.length + 1}`);
        player2Penalties.push(isGoal);
    }

    penaltyElement.style.backgroundColor = isGoal ? 'green' : 'red';

    if (player1Penalties.length === 1 && player2Penalties.length === 0) {
        setTimeout(() => {
            if (player1Score === player2Score) {
                animateText("EMPATE!", 'yellow', restartGame);
            } else {
                const winner = player1Score > player2Score ? 1 : 2;
                animateText(`VITÓRIA DO JOGADOR ${winner}!`, 'green', restartGame);
            }

            // recaregar a página
            setTimeout(() => {
                // chamar paginar de game over
                document.getElementById('gameScreen').style.display = 'none';
                document.getElementById('gameOverScreen').style.display = 'flex';
            }, 2000);
        }, 1000);
    }
}

function clearPenalties() {
    player1Penalties = [];
    player2Penalties = [];

    for (let i = 1; i <= 5; i++) {
        document.getElementById(`penaltyPlayer1_${i}`).style.backgroundColor = 'grey';
        document.getElementById(`penaltyPlayer2_${i}`).style.backgroundColor = 'grey';
    }
}

// Inicializar o jogo
function init() {
    drawField();
    drawBall();
    drawGoalkeeper();

    // Iniciar as animações
    animateIntensity();
    animateDirection();
    animateGoalkeeper();
}

// Configurar evento de clique para o botão Iniciar
// document.getElementById('startButton').addEventListener('click', function () {
//     document.getElementById('menu').style.display = 'none';
//     document.getElementById('gameScreen').style.display = 'flex';
//     init(); // Inicializa o jogo
// });


// Configurar evento de clique para o chute
document.getElementById('shootButton').addEventListener('click', shoot);

// Inicializar o jogo
init();
