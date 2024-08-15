<?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $score = intval($_POST['score']);
        // Aqui você pode salvar o placar em um banco de dados ou arquivo
        // Exemplo simples de salvamento em arquivo:
        file_put_contents('score.txt', "Placar atual: " . $score . "\n", FILE_APPEND);
    }
?>
