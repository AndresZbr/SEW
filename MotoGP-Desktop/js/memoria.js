class Memoria {
    constructor() {
        this.memoria = [];
    }

    voltearCarta(carta) {
        carta.dataset.estado = "volteada";
    }
}