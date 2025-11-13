class Noticias {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.noticias = [];

        this.seccion = document.createElement("div");
        this.seccion.id = "carrusel-container";
        document.querySelector("main").appendChild(this.seccion);
    }

    buscar() {
        const url = `https://api.thenewsapi.com/v1/news/all?api_token=${this.apiKey}&search=MotoGP&language=es`;
        $.getJSON(url, (data) => {
            this.noticias = data.data.map(n => ({
                titular: n.title,
                entradilla: n.description,
                enlace: n.url,
                fuente: n.source
            }));
            this.mostrarNoticias();
        });
    }

    mostrarNoticias() {
        this.seccion.innerHTML = '';

        this.noticias.forEach(n => {
            const article = document.createElement('article');
            const h2 = document.createElement('h2');
            h2.textContent = n.titular;
            const p = document.createElement('p');
            p.textContent = n.entradilla;
            const a = document.createElement('a');
            a.href = n.enlace;
            a.textContent = "Leer más";
            a.target = "_blank";
            const fuente = document.createElement('p');
            fuente.textContent = `Fuente: ${n.fuente}`;

            article.appendChild(h2);
            article.appendChild(p);
            article.appendChild(a);
            article.appendChild(fuente);
            this.seccion.appendChild(article);
        });
    }
}
