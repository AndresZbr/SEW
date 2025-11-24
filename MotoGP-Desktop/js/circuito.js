"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // Clase base para cargar archivos
    // ===============================
    class CargadorArchivo {
        constructor(accept) {
            this.accept = accept;
        }

        leerArchivo() {
            return new Promise((resolve, reject) => {
                if (!this.comprobarApiFile()) {
                    reject("El navegador no soporta File API");
                    return;
                }

                const input = document.createElement("input");
                input.type = "file";
                if (this.accept) input.accept = this.accept;

                input.addEventListener("change", () => {
                    const archivo = input.files && input.files[0];
                    if (!archivo) {
                        reject("No se seleccionó ningún archivo.");
                        return;
                    }

                    const lector = new FileReader();
                    lector.onload = () => resolve(lector.result);
                    lector.onerror = () => reject("Error leyendo el archivo: " + lector.error);
                    lector.readAsText(archivo);
                }, { once: true });

                input.click();
            });
        }

        comprobarApiFile() {
            return window.File && window.FileReader && window.FileList && window.Blob;
        }
    }

    // ===============================
    // Clase para cargar HTML
    // ===============================
    class CargadorHTML extends CargadorArchivo {

        constructor(button, sectionSelector) {
            super(".html,text/html");
            this.section = sectionSelector;
            this.button = button;
            this.iniciar();
        }

        iniciar() {
            this.button.addEventListener("click", async () => {
                try {
                    const texto = await this.leerArchivo();
                    this.insertarHTML(texto);
                } catch (err) {
                    console.error(err);
                    alert(typeof err === "string" ? err : "Error al cargar el HTML.");
                }
            });
        }

        insertarHTML(texto) {
            const doc = new DOMParser().parseFromString(texto, "text/html");

            // Quitar scripts por seguridad
            doc.querySelectorAll("script").forEach(s => s.remove());

            // Sustituir h1/h2 por h3
            doc.querySelectorAll("h1,h2").forEach(h => {
                const nuevoH = document.createElement("h3");
                nuevoH.innerHTML = h.innerHTML;
                h.replaceWith(nuevoH);
            });

            // Elegir contenido principal
            let contenido = doc.querySelector("main")
                ? Array.from(doc.querySelector("main").children)
                : Array.from(doc.body.children);

            // Arreglar rutas relativas ../
            contenido.forEach(el => {
                ["src", "href", "poster"].forEach(attr => {
                    if (el.hasAttribute(attr)) {
                        let val = el.getAttribute(attr);
                        if (/^\.\.\//.test(val)) {
                            val = val.replace(/^\.\.\//, "MotoGP-Desktop/");
                            el.setAttribute(attr, val);
                        }
                    }
                });
            });

            // Insertar directamente debajo de la sección
            contenido.forEach(el => this.section.insertAdjacentElement("beforeend", el));

            // Convertir PT10M30S en 10:30
            this.section.querySelectorAll("dd, p").forEach(el => {

                const duracion = el.textContent.trim();

                const match = duracion.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

                if (match) {
                    const h = parseInt(match[1] || 0, 10);
                    const m = parseInt(match[2] || 0, 10);
                    const s = parseInt(match[3] || 0, 10);

                    const resultado =
                        `${h ? h.toString().padStart(2, "0") + ":" : ""}` +
                        `${m.toString().padStart(2, "0")}:` +
                        `${s.toString().padStart(2, "0")}`;

                    // Reemplazar solo la parte PT... dentro del texto
                    el.textContent = el.textContent.replace(/PT.*?S/, resultado);
                }
            });

        }
    }


    // ===============================
    // Clase para cargar SVG
    // ===============================
    class CargadorSVG extends CargadorArchivo {

        constructor(button, seccion) {
            super(".svg,image/svg+xml");
            this.button = button;
            this.seccion = seccion;
            this.destino = null;
            this.iniciar();
        }

        iniciar() {
            this.button.addEventListener("click", async () => {
                try {
                    const svgText = await this.leerArchivo();
                    this.insertarSVG(svgText);
                } catch (err) {
                    console.error(err);
                    alert(typeof err === "string" ? err : "Error al cargar el SVG.");
                }
            });
        }

        insertarSVG(svgText) {

            if (!this.destino) {
                this.destino = document.createElement("figure"); // semántico
                this.seccion.appendChild(this.destino);
            }

            const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
            const svg = doc.querySelector("svg");

            if (svg && !svg.hasAttribute("viewBox")) {
                const w = svg.getAttribute("width");
                const h = svg.getAttribute("height");
                if (w && h) {
                    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
                    svg.setAttribute("width", "100%");
                    svg.setAttribute("height", "auto");
                }
            }

            this.destino.innerHTML = "";
            this.destino.appendChild(svg);
        }
    }

    // ===============================
    // Clase para cargar KML (mapa)
    // ===============================
    class CargadorKML extends CargadorArchivo {

        constructor(button, seccion) {
            super(".kml,application/xml,text/xml");
            this.button = button;
            this.seccion = seccion;
            this.figuraMapa = null;
            this.mapa = null;
            this.capaPolyline = null;
            this.iniciar();
        }

        iniciar() {
            this.button.addEventListener("click", async () => {
                try {
                    const kmlText = await this.leerArchivo();
                    this.procesarKML(kmlText);
                } catch (err) {
                    console.error(err);
                    alert(typeof err === "string" ? err : "Error al cargar el KML.");
                }
            });
        }

        inicializarMapaIfNeeded() {
            // Crear contenedor <figure> si no existe
            if (!this.figuraMapa) {
                this.figuraMapa = document.createElement("figure");
                this.figuraMapa.style.width = "100%";
                this.figuraMapa.style.height = "26rem";
                this.seccion.appendChild(this.figuraMapa);
            }

            // Crear mapa si no existe
            if (!this.mapa) {
                this.mapa = L.map(this.figuraMapa).setView([43.36, -5.85], 5);

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: "&copy; OpenStreetMap contributors"
                }).addTo(this.mapa);
            }

            return this.mapa;
        }

        procesarKML(texto) {
            const doc = new DOMParser().parseFromString(texto, "text/xml");
            const coordsNode = doc.querySelector("LineString > coordinates");
            const pointNode = doc.querySelector("Point > coordinates");

            if (!coordsNode && !pointNode) {
                alert("No se encontraron coordenadas en el KML.");
                return;
            }

            const coordsText = coordsNode ? coordsNode.textContent.trim() : "";
            const puntos = coordsText
                ? coordsText.split(/\s+/)
                    .map(pair => pair.split(",").map(Number))
                    .filter(arr => arr.length >= 2 && !arr.some(isNaN))
                    .map(([lon, lat]) => [lat, lon])
                : [];

            let origin = null;
            if (pointNode) {
                const p = pointNode.textContent.trim().split(",").map(Number);
                if (p.length >= 2 && !p.some(isNaN)) origin = [p[1], p[0]];
            } else if (puntos.length) {
                origin = puntos[0];
            }

            this.inicializarMapaIfNeeded();

            // Limpiar capa previa
            if (this.capaPolyline) {
                this.mapa.removeLayer(this.capaPolyline);
                this.capaPolyline = null;
            }

            // Añadir nueva polilínea
            if (puntos.length) {
                this.capaPolyline = L.polyline(puntos, { color: "red", weight: 3 }).addTo(this.mapa);
            }

            // Esperar un tick para asegurar que el contenedor tenga tamaño
            setTimeout(() => {
                if (this.capaPolyline) {
                    this.mapa.fitBounds(this.capaPolyline.getBounds(), { padding: [20, 20] });
                } else if (origin) {
                    this.mapa.setView(origin, 13);
                }
                this.mapa.invalidateSize(); // recalcular tamaño y centrar
            }, 50);

            // Añadir marcador de origen
            if (origin) {
                L.marker(origin).addTo(this.mapa).bindTooltip("Inicio").openTooltip();
            }
        }
    }


    // ===============================
    // Instanciación
    // ===============================
    const secciones = document.querySelectorAll("main > section");
    new CargadorHTML(secciones[0].querySelector("button"), secciones[0]);
    new CargadorSVG(secciones[1].querySelector("button"), secciones[1]);
    new CargadorKML(secciones[2].querySelector("button"), secciones[2]);

});
