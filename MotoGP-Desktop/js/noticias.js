class Noticias {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.noticias = [];

        // Contenedor semántico
        this.seccion = document.createElement("section");
        this.seccion.id = "noticias-container";
        this.seccion.setAttribute("aria-label", "Últimas noticias de MotoGP");
        document.querySelector("main").appendChild(this.seccion);
    }

    async buscar() {
        const url = `https://api.thenewsapi.com/v1/news/all?api_token=${this.apiKey}&search=MotoGP&language=es`;

        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error("Error al obtener noticias");
            const data = await resp.json();

            this.noticias = data.data.map(n => ({
                titular: n.title,
                entradilla: n.description,
                enlace: n.url,
                fuente: n.source
            }));

            this.mostrarNoticias();

        } catch (error) {
            console.error("Error al cargar noticias:", error);
            this.seccion.innerHTML = "<p>No se pudieron cargar las noticias.</p>";
        }
    }

    mostrarNoticias() {
        this.seccion.innerHTML = "";

        if (this.noticias.length === 0) {
            const p = document.createElement("p");
            p.textContent = "No se encontraron noticias.";
            this.seccion.appendChild(p);
            return;
        }

        this.noticias.forEach(n => {
            const article = document.createElement("article");
            article.setAttribute("aria-label", n.titular);

            const h2 = document.createElement("h2");
            h2.textContent = n.titular;

            const p = document.createElement("p");
            p.textContent = n.entradilla;

            const a = document.createElement("a");
            a.href = n.enlace;
            a.textContent = "Leer más";
            a.target = "_blank";
            a.rel = "noopener noreferrer"; // seguridad

            const fuente = document.createElement("p");
            fuente.textContent = `Fuente: ${n.fuente}`;

            article.append(h2, p, a, fuente);
            this.seccion.appendChild(article);
        });
    }
}
