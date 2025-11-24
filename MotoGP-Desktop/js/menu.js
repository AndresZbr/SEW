class Menu {
    #header;
    #nav;
    #button;

    constructor() {
        // Guardamos el header
        this.#header = document.querySelector("header");
        if (!this.#header) return;

        // Nav dentro del header
        this.#nav = this.#header.querySelector("nav");

        // Botón dentro del header
        this.#button = this.#header.querySelector("button");

        // Si falta algo, no inicializamos
        if (!this.#nav || !this.#button) return;

        this.#inicializarEventos();
        this.#setExpanded(false);
    }

    // ===========================
    // MÉTODOS PRIVADOS
    // ===========================

    #inicializarEventos() {

        // Toggle
        this.#button.addEventListener("click", () => {
            const abierto = this.#button.getAttribute("aria-expanded") === "true";
            this.#setExpanded(!abierto);
        });

        // Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                const abierto = this.#button.getAttribute("aria-expanded") === "true";
                if (abierto) this.#setExpanded(false);
            }
        });

        // Cerrar clicando fuera
        document.addEventListener("click", (e) => {
            const abierto = this.#button.getAttribute("aria-expanded") === "true";
            if (!abierto) return;

            if (!this.#header.contains(e.target)) {
                this.#setExpanded(false);
            }
        });
    }

    #setExpanded(expanded) {
        this.#button.setAttribute("aria-expanded", String(expanded));
        this.#button.setAttribute("aria-label", expanded ? "Cerrar menú" : "Abrir menú");
        this.#nav.setAttribute("data-open", expanded ? "true" : "false");

        // Accesibilidad
        if (expanded) {
            const firstLink = this.#nav.querySelector("a");
            if (firstLink) firstLink.focus();
        } else {
            this.#button.focus();
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new Menu();
});
