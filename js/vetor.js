
// Função para calcular o vetor direcional
function calcularVetorDirecional(pontoA, pontoB) {
    return {
        x: pontoB.x - pontoA.x,
        y: pontoB.y - pontoA.y
    };
}

// Função para verificar se dois vetores são proporcionais
function saoProporcionais(vetor1, vetor2) {
    return vetor1.x * vetor2.y === vetor1.y * vetor2.x;
}

function verificarIntersecaoReta(B0, Bf, G0, Gf) {
    // Função auxiliar para calcular o determinante de uma matriz 2x2
    function determinante(a, b, c, d) {
        return a * d - b * c;
    }

    // Vetores das retas
    const vetorBF = { x: Bf.x - B0.x, y: Bf.y - B0.y };
    const vetorG0Gf = { x: Gf.x - G0.x, y: Gf.y - G0.y };

    // Calcula o determinante para verificar se as retas são paralelas
    const det = determinante(vetorBF.x, vetorG0Gf.x, vetorBF.y, vetorG0Gf.y);

    // Se o determinante for zero, as retas são paralelas (ou coincidentes)
    if (det === 0) {
        return false; // Não há interseção entre as retas (ou são coincidentes)
    }

    // Se não forem paralelas, calcular os parâmetros de interseção
    const t = determinante(G0.x - B0.x, vetorG0Gf.x, G0.y - B0.y, vetorG0Gf.y) / det;
    const u = determinante(G0.x - B0.x, vetorBF.x, G0.y - B0.y, vetorBF.y) / det;

    // Verificar se as interseções estão dentro do intervalo [0, 1] para ambos os segmentos
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return true; // As retas se cruzam dentro dos segmentos
    } else {
        return false; // As retas não se cruzam dentro dos segmentos
    }
}
