// Versión 1.4 - 24/11/2025 - Semántica W3C y carrusel con Flickr
class Carrusel {
    constructor(busqueda) {
        this.busqueda = busqueda;
        this.actual = 0;
        this.fotos = [];
        this.intervalo = null; // Para controlar el setInterval

        // Contenedor semántico
        this.seccion = document.createElement("section");
        this.seccion.id = "carrusel-container";
        this.seccion.setAttribute("aria-live", "polite"); // accesibilidad
        document.querySelector("main").appendChild(this.seccion);
    }

    getFotografias() {
        const flickrAPI = "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";

        $.getJSON(flickrAPI, {
            tags: this.busqueda,
            tagmode: "any",
            format: "json"
        })
        .done((data) => {
            this.procesarJSONFotografias(data);
            this.mostrarFotografias();
        })
        .fail((error) => {
            console.error("Error al cargar imágenes de Flickr:", error);
            this.seccion.textContent = "No se pudieron cargar las imágenes.";
        });
    }

    procesarJSONFotografias(data) {
        this.fotos = data.items.map(item =>
            item.media.m.replace("_m.", "_z.") // tamaño grande
        );
        this.maximo = this.fotos.length;
    }

    mostrarFotografias() {
        this.seccion.innerHTML = ""; // limpiar contenido previo

        if (this.fotos.length === 0) {
            const p = document.createElement("p");
            p.textContent = "No se encontraron imágenes.";
            this.seccion.appendChild(p);
            return;
        }

        const article = document.createElement("article");

        const h2 = document.createElement("h2");
        h2.textContent = `Imágenes del circuito de ${this.busqueda}`;

        const img = document.createElement("img");
        img.src = this.fotos[this.actual];
        img.alt = `Foto de ${this.busqueda}`;
        img.width = 640; // opcional, para accesibilidad y layout
        img.height = 480;

        article.appendChild(h2);
        article.appendChild(img);
        this.seccion.appendChild(article);

        // Evitar duplicar intervalos
        if (this.intervalo) clearInterval(this.intervalo);
        this.intervalo = setInterval(() => this.cambiarFotografia(), 3000);
    }

    cambiarFotografia() {
        if (this.fotos.length === 0) return;
        this.actual = (this.actual + 1) % this.maximo;
        const img = this.seccion.querySelector("article img");
        if (img) img.src = this.fotos[this.actual];
    }
}
