class Cronometro {
    // Atributos del cronómetro
    #inicio;
    #tiempo;
    #corriendo;

    // Inicializar el cronómetro
    constructor() {
        this.#inicio = null;
        this.#tiempo = 0;
        this.#corriendo = null;
    }

    // Arrancar el cronómetro
    arrancar() {
        try {
            this.#inicio = Temporal.Now.instant();
        } catch {
            this.#inicio = Date.now();
        }
        this.#corriendo = setInterval(() => this.#actualizar(), 100);
    }

    // Actualizar el tiempo transcurrido
    #actualizar() {
        let final;
        try {
            final = Temporal.Now.instant();
            this.#tiempo = final.epochMilliseconds - this.#inicio.epochMilliseconds;
        } catch {
            final = Date.now();
            this.#tiempo = final - this.#inicio;
        }
        this.#mostrar();
    }
    
    // Mostrar el tiempo transcurrido
    #mostrar() {
        const minutos = parseInt(this.#tiempo / 60000);
        const segundos = parseInt((this.#tiempo % 60000) / 1000);
        const decimas = parseInt((this.#tiempo % 1000) / 100);

        const texto = `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}.${decimas}`;

        const p = document.querySelector("main p");
        if (p) p.textContent = texto;
    }
    
    // Parar el cronómetro
    parar() {
        clearInterval(this.#corriendo);
        this.#corriendo = null;
    }

    // Reiniciar el cronómetro
    reiniciar() {
        this.parar();
        this.#tiempo = 0;
        this.#mostrar();
    }
}


// Crear instancia del cronómetro cuando cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
    const cronometro = new Cronometro();

    // Seleccionar botones
    const botonIniciar = document.querySelector("button#iniciar");
    const botonParar = document.querySelector("button#parar");
    const botonReiniciar = document.querySelector("button#reiniciar");

    // Asignar eventos sin usar atributos HTML
    botonIniciar.addEventListener("click", () => cronometro.arrancar());
    botonParar.addEventListener("click", () => cronometro.parar());
    botonReiniciar.addEventListener("click", () => cronometro.reiniciar());
});
