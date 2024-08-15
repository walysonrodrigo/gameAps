const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const intensityCanvas = document.getElementById('intensityCanvas');
const intensityCtx = intensityCanvas.getContext('2d');
const directionCanvas = document.getElementById('directionCanvas');
const directionCtx = directionCanvas.getContext('2d');

let playerScore = 0;
let goalkeeperX = 360; // Posição inicial do goleiro no eixo X
let goalkeeperY = 60;  // Posição inicial do goleiro no eixo Y
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

// Tamanho da bola
const ballRadius = 10;

// Tamanho do goleiro
const goalkeeperWidth = 60;
const goalkeeperHeight = 15;

// Espaço adicional fora do gol
const additionalSpace = 50;

// Desenhar o campo e o gol
function drawField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#6ab150';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gol
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(goalX, goalY, goalWidth, 15); // Barra superior
    ctx.fillRect(goalX, goalY, 15, goalHeight); // Barra lateral esquerda
    ctx.fillRect(goalX + goalWidth - 15, goalY, 15, goalHeight); // Barra lateral direita
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
    ctx.fillRect(goalkeeperX, goalkeeperY, goalkeeperWidth, goalkeeperHeight); // Goleiro
}

// Animação do goleiro (movimento nos eixos X e Y)
function animateGoalkeeper() {
    goalkeeperMoving = true;
    const interval = setInterval(() => {
        // Movimento no eixo X
        if (goalkeeperDirectionX === 'right') {
            goalkeeperX += 5;
            if (goalkeeperX >= goalX + goalWidth - goalkeeperWidth) { // Limite à direita do gol
                goalkeeperDirectionX = 'left';
            }
        } else {
            goalkeeperX -= 5;
            if (goalkeeperX <= goalX) { // Limite à esquerda do gol
                goalkeeperDirectionX = 'right';
            }
        }

        // Movimento no eixo Y
        if (goalkeeperDirectionY === 'down') {
            goalkeeperY += 5;
            if (goalkeeperY >= goalY + goalHeight - goalkeeperHeight) { // Limite inferior do gol
                goalkeeperDirectionY = 'up';
            }
        } else {
            goalkeeperY -= 5;
            if (goalkeeperY <= goalY) { // Limite superior do gol
                goalkeeperDirectionY = 'down';
            }
        }

        drawField();
        drawGoalkeeper();
        drawBall();

        if (!goalkeeperMoving) {
            clearInterval(interval);
        }
    }, 50); // Velocidade do movimento do goleiro
}

// Verificar se o chute foi gol
function checkGoal() {
    const goalArea = {
        x: goalX - additionalSpace,
        y: goalY,
        width: goalWidth + 2 * additionalSpace,
        height: goalHeight
    };

    const isGoalkeeperCovering = ballX + ballRadius > goalkeeperX && ballX - ballRadius < goalkeeperX + goalkeeperWidth &&
                                ballY + ballRadius > goalkeeperY && ballY - ballRadius < goalkeeperY + goalkeeperHeight;

    // Verificar se a bola tocou a trave
    const isBallInsideGoal = ballX + ballRadius >= goalArea.x && ballX - ballRadius <= goalArea.x + goalArea.width &&
                            ballY + ballRadius >= goalArea.y && ballY - ballRadius <= goalArea.y + goalArea.height;

    const isBallTouchingCrossbar = isBallInsideGoal && ballY - ballRadius <= goalY + 15 && ballX + ballRadius >= goalX && ballX - ballRadius <= goalX + goalWidth;
    const isBallTouchingSideBarLeft = isBallInsideGoal && ballX - ballRadius <= goalX + 15 && ballY + ballRadius >= goalY && ballY - ballRadius <= goalY + goalHeight;
    const isBallTouchingSideBarRight = isBallInsideGoal && ballX + ballRadius >= goalX + goalWidth - 15 && ballY + ballRadius >= goalY && ballY - ballRadius <= goalY + goalHeight;

    if (isGoalkeeperCovering) {
        alert("O goleiro defendeu!");
    } else if (isBallTouchingCrossbar || isBallTouchingSideBarLeft || isBallTouchingSideBarRight) {
        alert("A bola tocou na trave!");
    } else if (isBallInsideGoal) {
        playerScore++;
        updateScore(playerScore); // Atualizar o placar com animação

        // disparar gif de comemoração no html
        document.getElementById("celebration").style.display = "block";

        setTimeout(function() {
            document.getElementById("celebration").style.display = "none";
        }, 5000);
    } else {
        alert("A bola saiu!");
    }

    // Reiniciar o jogo após o chute
    restartGame(); // Reiniciar imediatamente após o chute
}

// Função para atualizar o placar com animação
function updateScore(newScore) {
    // Atualizar o valor do placar com uma animação de aumento
    const scoreElement = document.getElementById('score');
    let currentScore = parseInt(scoreElement.innerText);
    let increment = (newScore - currentScore) / 10; // Dividir a diferença em 10 etapas

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

// Salvar o placar usando PHP (AJAX)
function saveScore(score) {
    fetch('save_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `score=${score}`
    });
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
        shotDirection += 2; // Ajustar a velocidade para balancear a sensibilidade
        if (shotDirection >= directionCanvas.width - 5) { // Limite direito
            directionMovingRight = false;
        }
    } else {
        shotDirection -= 2; // Ajustar a velocidade para balancear a sensibilidade
        if (shotDirection <= 5) { // Limite esquerdo
            directionMovingRight = true;
        }
    }

    directionAnimationId = requestAnimationFrame(animateDirection);
}

// Animação da bola até o gol
function animateBall(targetX, targetY) {
    shooting = true;
    const interval = setInterval(() => {
        // Movimento gradual da bola com fator aleatório
        const randomnessX = (Math.random() - 0.5) * 5; // Aleatoriedade no eixo X
        const randomnessY = (Math.random() - 0.5) * 5; // Aleatoriedade no eixo Y

        const dx = (targetX - ballX) * 0.1 + randomnessX;
        const dy = (targetY - ballY) * 0.1 + randomnessY;

        ballX += dx;
        ballY += dy;

        drawField();
        drawGoalkeeper();
        drawBall();

        if (Math.abs(ballX - targetX) <= 5 && Math.abs(ballY - targetY) <= 5) {
            clearInterval(interval);
            shooting = false;
            checkGoal(); // Verifica se a bola entrou ou foi defendida
        }
    }, 50);
}

// Reiniciar o jogo
function restartGame() {
    goalkeeperX = goalX + (goalWidth - goalkeeperWidth) / 2; // Centralizar o goleiro no novo tamanho do gol
    goalkeeperY = goalY;
    ballX = 400;
    ballY = 300;
    shotIntensity = 5;
    shotDirection = 250;

    drawField();
    drawGoalkeeper();
    drawBall();

    // Parar e reiniciar as animações dos gráficos
    cancelAnimationFrame(intensityAnimationId);
    cancelAnimationFrame(directionAnimationId);

    // Redesenhar gráficos de intensidade e direção
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
    const targetY = goalY + goalHeight - (shotIntensity * 10); // Ajustar a altura baseada na intensidade

    // Restringir a posição X da bola dentro dos limites do campo com espaço adicional
    const constrainedTargetX = Math.min(Math.max(targetX, goalX - additionalSpace), goalX + goalWidth + additionalSpace);

    // Iniciar a animação da bola
    animateBall(constrainedTargetX, targetY);

    // Iniciar o movimento do goleiro
    animateGoalkeeper();
}

// Inicializar o jogo
function init() {
    drawField();
    drawBall();

    // Iniciar as animações
    animateIntensity();
    animateDirection();
}

// Configurar evento de clique para o botão Iniciar
// document.getElementById('startButton').addEventListener('click', function() {
//     document.getElementById('menu').style.display = 'none';
//     document.getElementById('gameScreen').style.display = 'flex';
//     init(); // Inicializa o jogo
// });


// Configurar evento de clique para o chute
document.getElementById('shootButton').addEventListener('click', shoot);

// Inicializar o jogo
init();


