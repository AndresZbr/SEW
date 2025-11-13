// Versión 1.3 - 30/10/2025 - HTTPS con jQuery y API pública de Flickr
class Carrusel {
    constructor(busqueda) {
        this.busqueda = busqueda;
        this.actual = 0;
        this.fotos = [];

        this.seccion = document.createElement("div");
        this.seccion.id = "carrusel-container";
        document.querySelector("main").appendChild(this.seccion);
    }

    getFotografias() {
        const flickrAPI = "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";

        $.getJSON(flickrAPI, {
            tags: this.busqueda,  // palabra clave de búsqueda
            tagmode: "any",
            format: "json"
        })
            .done((data) => {
                this.procesarJSONFotografias(data);
                this.mostrarFotografias();
            })
            .fail((error) => {
                console.error("Error al cargar imágenes de Flickr:", error);
            });
    }

    procesarJSONFotografias(data) {
        this.fotos = data.items.map(item =>
            item.media.m.replace("_m.", "_z.")  // cambia "_m" por "_b" (grande)
        );
        this.maximo = this.fotos.length;
    }

    mostrarFotografias() {
        this.seccion.innerHTML = ''; // Limpiar contenido previo

        if (this.fotos.length === 0) {
            this.seccion.textContent = "No se encontraron imágenes.";
            return;
        }

        const article = document.createElement('article');
        const h2 = document.createElement('h2');
        h2.textContent = `Imágenes del circuito de ${this.busqueda}`;
        const img = document.createElement('img');
        img.src = this.fotos[this.actual];
        img.alt = `Foto de ${this.busqueda}`;

        article.appendChild(h2);
        article.appendChild(img);
        this.seccion.appendChild(article);

        setInterval(() => this.cambiarFotografia(), 3000);
    }

    cambiarFotografia() {
        if (this.fotos.length === 0) return;
        this.actual = (this.actual + 1) % this.maximo;
        const img = document.querySelector('#carrusel article img');
        if (img) img.src = this.fotos[this.actual];
    }
}
