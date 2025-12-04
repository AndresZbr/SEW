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
    // ===============================
    // Clase para cargar KML (mapa) - MAPBOX
    // ===============================
    class CargadorKML extends CargadorArchivo {

        constructor(button, seccion) {
            super(".kml,application/xml,text/xml");
            this.button = button;
            this.seccion = seccion;
            this.contenedorMapa = document.getElementById("mapa");
            this.map = null;
            this.lineLayerId = "kml-line";
            this.pointLayerId = "kml-point";
            this.sourceId = "kml-source";
            this.iniciar();
        }

        iniciar() {
            this.button.addEventListener("click", async () => {
                try {
                    const kmlText = await this.leerArchivo();
                    const geojson = this.kmlAgeojson(kmlText);

                    if (!this.map) this.crearMapa();

                    this.dibujarGeoJSON(geojson);
                    this.fitGeoJSON(geojson);

                } catch (err) {
                    console.error(err);
                    alert(typeof err === "string" ? err : "Error al cargar el KML.");
                }
            });
        }

        crearMapa() {
            mapboxgl.accessToken = "pk.eyJ1IjoiYW5keW5zcXVlMTIiLCJhIjoiY21pbG1tcWxwMDc4YTNkc2RubHZqMXlzNiJ9.Y0prwI6xU3sd8nZ9GVdAZw";

            this.contenedorMapa.style.width = "100%";
            this.contenedorMapa.style.height = "26rem";

            this.map = new mapboxgl.Map({
                container: this.contenedorMapa,
                style: "mapbox://styles/mapbox/streets-v12",
                center: [-3.7038, 40.4168],
                zoom: 4
            });

            // ⚠ MUY IMPORTANTE
            this.map.once("load", () => {
                this.map.loadedFully = true;
            });
        }


        kmlAgeojson(kmlText) {
            const parser = new DOMParser();
            const kml = parser.parseFromString(kmlText, "text/xml");

            const coordsNode = kml.querySelector("LineString > coordinates");
            const pointNode = kml.querySelector("Point > coordinates");

            // Ruta (LineString)
            let lineCoords = [];
            if (coordsNode) {
                lineCoords = coordsNode.textContent.trim()
                    .split(/\s+/)
                    .map(pair => pair.split(",").map(Number))
                    .map(([lon, lat]) => [lon, lat]);
            }

            // Origen (Point)
            let point = null;
            if (pointNode) {
                const arr = pointNode.textContent.trim().split(",").map(Number);
                point = [arr[0], arr[1]];
            } else if (lineCoords.length) {
                point = lineCoords[0];
            }

            // Construimos un FeatureCollection compatible
            const fc = {
                type: "FeatureCollection",
                features: []
            };

            if (lineCoords.length) {
                fc.features.push({
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: lineCoords
                    }
                });
            }

            if (point) {
                fc.features.push({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: point
                    },
                    properties: { title: "Inicio" }
                });
            }

            return fc;
        }

        dibujarGeoJSON(geojson) {
            if (!this.map || !this.map.loaded()) {
                // Esperamos a que se cargue el mapa antes de dibujar
                this.map.once("load", () => this.dibujarGeoJSON(geojson));
                return;
            }

            // eliminar capas previas
            if (this.map.getLayer(this.lineLayerId)) this.map.removeLayer(this.lineLayerId);
            if (this.map.getLayer(this.pointLayerId)) this.map.removeLayer(this.pointLayerId);
            if (this.map.getSource(this.sourceId)) this.map.removeSource(this.sourceId);

            // añadir source
            this.map.addSource(this.sourceId, {
                type: "geojson",
                data: geojson
            });

            // capa de línea
            this.map.addLayer({
                id: this.lineLayerId,
                type: "line",
                source: this.sourceId,
                paint: {
                    "line-width": 4,
                    "line-color": "#ff0000"
                },
                filter: ["==", ["geometry-type"], "LineString"]
            });

            // capa de punto de inicio
            this.map.addLayer({
                id: this.pointLayerId,
                type: "circle",
                source: this.sourceId,
                paint: {
                    "circle-radius": 6,
                    "circle-color": "#0000ff"
                },
                filter: ["==", ["geometry-type"], "Point"]
            });
        }


        fitGeoJSON(geojson) {
            const bounds = new mapboxgl.LngLatBounds();
            let hasCoords = false;

            geojson.features.forEach(f => {
                if (f.geometry.type === "LineString") {
                    f.geometry.coordinates.forEach(c => {
                        bounds.extend(c);
                        hasCoords = true;
                    });
                }
                if (f.geometry.type === "Point") {
                    bounds.extend(f.geometry.coordinates);
                    hasCoords = true;
                }
            });

            if (hasCoords) {
                setTimeout(() => {
                    this.map.fitBounds(bounds, { padding: 40 });
                }, 300);
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

    const cargadorKML = new CargadorKML(
        secciones[2].querySelector("button"),
        secciones[2]
    );

    // Crear el mapa automáticamente al cargar la página
    cargadorKML.crearMapa();
});
