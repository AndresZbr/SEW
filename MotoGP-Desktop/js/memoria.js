class Memoria {
    // Atributos del juego
    #tableroBloqueado;
    #primeraCarta;
    #segundaCarta;
    #cronometro;

    // Inicializar el juego
    constructor() {
        this.#tableroBloqueado = false;
        this.#primeraCarta = null;
        this.#segundaCarta = null;

        this.#cronometro = new Cronometro();
        this.#cronometro.arrancar();
    }

    // Voltear una carta
    voltearCarta(carta) {
        if (carta.dataset.estado === "volteada" || carta.dataset.estado === "revelada") return;
        if (this.#tableroBloqueado) return;

        carta.dataset.estado = "volteada";

        if (!this.#primeraCarta) {
            this.#primeraCarta = carta;
        } else {
            this.#segundaCarta = carta;
            this.#tableroBloqueado = true;
            setTimeout(() => this.#comprobarPareja(), 500);
        }
    }

    // Barajar las cartas aleatoriamente
    barajarCartas() {
        const contenedor = document.querySelector("main");
        const cartas = Array.from(contenedor.querySelectorAll("article"));

        // Fisher-Yates
        for (let i = cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
        }

        cartas.forEach(carta => carta.remove());
        cartas.forEach(carta => contenedor.appendChild(carta));
    }

    // Reiniciar los atributos después de comprobar la pareja
    #reiniciarAtributos() {
        this.#tableroBloqueado = false;
        this.#primeraCarta = null;
        this.#segundaCarta = null;
    }

    // Deshabilitar las cartas si son iguales
    #deshabilitarCartas() {
        this.#primeraCarta.dataset.estado = "revelada";
        this.#segundaCarta.dataset.estado = "revelada";

        this.#comprobarJuego();
        this.#reiniciarAtributos();
    }

    // Cubrir las cartas si no son iguales
    #cubrirCartas() {
        setTimeout(() => {
            this.#primeraCarta.dataset.estado = null;
            this.#segundaCarta.dataset.estado = null;
            this.#reiniciarAtributos();
        }, 1000);
    }

    // Comprobar si las dos cartas volteadas son iguales
    #comprobarPareja() {
        const img1 = this.#primeraCarta.querySelector("img").src;
        const img2 = this.#segundaCarta.querySelector("img").src;

        img1 === img2 ? this.#deshabilitarCartas() : this.#cubrirCartas();
    }

    // Comprobar si todas las cartas están reveladas
    #comprobarJuego() {
        const cartas = document.querySelectorAll("main article");
        const todas = [...cartas].every(c => c.dataset.estado === "revelada");

        if (todas) {
            this.#cronometro.parar();
        }
    }

    // Reiniciar el juego: estados, cronómetro y orden
    reiniciarJuego() {
        const main = document.querySelector("main");
        const contenedor = main.querySelector("section") || main;
        const cartas = Array.from(contenedor.querySelectorAll("article"));

        cartas.forEach(c => c.dataset.estado = null);
        this.#tableroBloqueado = false;
        this.#primeraCarta = null;
        this.#segundaCarta = null;

        this.#cronometro.reiniciar();
        this.#cronometro.arrancar();

        this.barajarCartas();
    }
}

// Cuando el DOM esté cargado, inicamos el juego
document.addEventListener("DOMContentLoaded", () => {

    const memoria = new Memoria();
    memoria.barajarCartas();

    // Añadir listeners a las cartas sin usar atributos HTML
    const cartas = document.querySelectorAll("main article");

    cartas.forEach(carta => {
        carta.addEventListener("click", () => memoria.voltearCarta(carta));
    });

});