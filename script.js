<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jogo de Pênaltis</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
            text-align: center;
        }

        #gameCanvas {
            border: 2px solid #000;
            background-color: #4CAF50;
        }

        #intensityCanvas, #directionCanvas {
            border: 1px solid #000;
            margin: 10px;
            background-color: #ffffff;
            cursor: pointer;
        }

        #score {
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: bold;
        }

        button {
            padding: 10px 20px;
            margin-top: 10px;
            font-size: 18px;
            cursor: pointer;
            border: none;
            border-radius: 5px;
            background-color: #4CAF50;
            color: white;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        button:hover {
            background-color: #45a049;
        }

        #menu {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        #startButton {
            padding: 15px 30px;
            font-size: 24px;
            cursor: pointer;
            border: none;
            border-radius: 10px;
            background-color: #4CAF50;
            color: white;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }

        #gameScreen {
            display: none;
            flex-direction: column;
            align-items: center;
        }

        #info {
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div id="menu" class="container">
        <h1>Bem-vindo ao Jogo de Pênaltis</h1>
        <button id="startButton">Começar o Jogo</button>
    </div>

    <div id="gameScreen" class="container">
        <div id="info">Clique em "Chutar" para começar o jogo!</div>
        <canvas id="gameCanvas" width="800" height="400"></canvas>
        <canvas id="intensityCanvas" width="300" height="50"></canvas>
        <canvas id="directionCanvas" width="500" height="50"></canvas>
        <div id="score">0</div>
        <button id="shootButton">Chutar</button>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const intensityCanvas = document.getElementById('intensityCanvas');
        const intensityCtx = intensityCanvas.getContext('2d');
        const directionCanvas = document.getElementById('directionCanvas');
        const directionCtx = directionCanvas.getContext('2d');

        let playerScore = 0;
        let goalkeeperX = 360; // Posição inicial do goleiro no eixo X
        let goalkeeperY = 60;  // Posição inicial do goleiro no eixo Y
        let shotIntensity = 5;
        let shotDirection = 250; // Centralizado no canvas de direção
        let intensityIncreasing = true;
        let directionMovingRight = true;
        let goalkeeperDirectionX = 'right';
        let goalkeeperDirectionY = 'down';
        let intensityAnimationId;
        let directionAnimationId;
        let ballX = 400; // Posição inicial da bola
        let ballY = 300; // Posição inicial da bola
        let shooting = false; // Controle de chute

        const goalWidth = 300;
        const goalHeight = 130;
        const goalX = (canvas.width - goalWidth) / 2;
        const goalY = 50;

        const ballRadius = 10;
        const goalkeeperWidth = 60;
        const goalkeeperHeight = 15;
        const additionalSpace = 50;

        function drawField() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6ab150';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(goalX, goalY, goalWidth, 15);
            ctx.fillRect(goalX, goalY, 15, goalHeight);
            ctx.fillRect(goalX + goalWidth - 15, goalY, 15, goalHeight);
        }

        function drawBall() {
            ctx.beginPath();
            ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.closePath();
        }

        function drawGoalkeeper() {
            ctx.fillStyle = '#000000';
            ctx.fillRect(goalkeeperX, goalkeeperY, goalkeeperWidth, goalkeeperHeight);
        }

        function animateGoalkeeper() {
            goalkeeperMoving = true;

            function moveGoalkeeper() {
                // Movimento no eixo X
                if (goalkeeperDirectionX === 'right') {
                    goalkeeperX += 4;
                    if (goalkeeperX >= goalX + goalWidth - goalkeeperWidth) {
                        goalkeeperDirectionX = 'left';
                    }
                } else {
                    goalkeeperX -= 4;
                    if (goalkeeperX <= goalX) {
                        goalkeeperDirectionX = 'right';
                    }
                }

                // Movimento no eixo Y
                if (goalkeeperDirectionY === 'down') {
                    goalkeeperY += 2;
                    if (goalkeeperY >= goalY + goalHeight - goalkeeperHeight) {
                        goalkeeperDirectionY = 'up';
                    }
                } else {
                    goalkeeperY -= 2;
                    if (goalkeeperY <= goalY) {
                        goalkeeperDirectionY = 'down';
                    }
                }

                drawField();
                drawGoalkeeper();
                drawBall();

                if (shooting) {
                    requestAnimationFrame(moveGoalkeeper);
                }
            }

            moveGoalkeeper();
        }

        function checkGoal() {
            const goalArea = {
                x: goalX - additionalSpace,
                y: goalY,
                width: goalWidth + 2 * additionalSpace,
                height: goalHeight
            };

            const isGoalkeeperCovering = ballX + ballRadius > goalkeeperX && ballX - ballRadius < goalkeeperX + goalkeeperWidth &&
                ballY + ballRadius > goalkeeperY && ballY - ballRadius < goalkeeperY + goalkeeperHeight;

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
                document.getElementById('score').innerText = playerScore;
                alert("Gol!");
            } else {
                alert("A bola saiu!");
            }

            restartGame();
        }

        function animateIntensity() {
            intensityCtx.clearRect(0, 0, intensityCanvas.width, intensityCanvas.height);

            intensityCtx.fillStyle = '#FF0000';
            const intensityWidth = shotIntensity * 30;
            intensityCtx.fillRect(0, 0, intensityWidth, intensityCanvas.height);

            if (intensityIncreasing) {
                shotIntensity += 0.1;
                if (shotIntensity >= 10) {
                    intensityIncreasing = false;
                }
            } else {
                shotIntensity -= 0.1;
                if (shotIntensity <= 1) {
                    intensityIncreasing = true;
                }
            }

            intensityAnimationId = requestAnimationFrame(animateIntensity);
        }

        function animateDirection() {
            directionCtx.clearRect(0, 0, directionCanvas.width, directionCanvas.height);

            directionCtx.fillStyle = '#0000FF';
            directionCtx.fillRect(shotDirection - 5, 0, 10, directionCanvas.height);

            if (directionMovingRight) {
                shotDirection += 4;
                if (shotDirection >= directionCanvas.width - 5) {
                    directionMovingRight = false;
                }
            } else {
                shotDirection -= 4;
                if (shotDirection <= 5) {
                    directionMovingRight = true;
                }
            }

            directionAnimationId = requestAnimationFrame(animateDirection);
        }

        function animateShot() {
            shooting = true;
            const dx = (shotDirection - ballX) / (40 - shotIntensity);
            const dy = -(ballY - goalY - 20) / (40 - shotIntensity);

            function moveBall() {
                ballX += dx;
                ballY += dy;

                drawField();
                drawGoalkeeper();
                drawBall();

                if (ballY <= goalY + goalHeight && ballY + ballRadius > goalY && ballX > goalX - additionalSpace && ballX < goalX + goalWidth + additionalSpace) {
                    requestAnimationFrame(moveBall);
                } else {
                    checkGoal();
                }
            }

            moveBall();
        }

        function restartGame() {
            ballX = 400;
            ballY = 300;
            shooting = false;
            drawField();
            drawGoalkeeper();
            drawBall();
            animateIntensity();
            animateDirection();
        }

        document.getElementById('startButton').addEventListener('click', () => {
            document.getElementById('menu').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'flex';
            restartGame();
        });

        document.getElementById('shootButton').addEventListener('click', () => {
            if (!shooting) {
                cancelAnimationFrame(intensityAnimationId);
                cancelAnimationFrame(directionAnimationId);
                animateShot();
            }
        });

        drawField();
        drawGoalkeeper();
        drawBall();
        animateIntensity();
        animateDirection();
    </script>
</body>

</html>
