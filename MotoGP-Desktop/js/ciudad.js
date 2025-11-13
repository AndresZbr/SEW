/*
Andres Zhou Blanco Rodriguez
UO300351
Clase Ciudad para el proyecto MotoGP-Desktop
Incluye métodos para meteorología de carrera y entrenamientos
Versión sin jQuery — totalmente compatible con las recomendaciones del W3C
*/

class Ciudad {
    // Atributos privados
    #nombre;
    #pais;
    #gentilicio;
    #poblacion;
    #coordenadas;

    // Constructor
    constructor(nombre, pais, gentilicio) {
        this.#nombre = nombre;
        this.#pais = pais;
        this.#gentilicio = gentilicio;
        this.#poblacion = 0;
        this.#coordenadas = [0, 0, 0];
    }

    // -------------------------------
    // Métodos de información general
    // -------------------------------

    rellenarDatos(poblacion, coordenadas) {
        this.#poblacion = poblacion;
        this.#coordenadas = coordenadas;
    }

    obtenerNombreCiudad() { return this.#nombre; }
    obtenerNombrePais() { return this.#pais; }

    obtenerInfoSecundaria() {
        const ul = document.createElement("ul");
        ul.innerHTML = `
            <li>Gentilicio: ${this.#gentilicio}</li>
            <li>Población: ${this.#poblacion.toLocaleString()} habitantes</li>
        `;
        return ul;
    }

    obtenerCoordenadas() { return this.#coordenadas; }

    crearInfoHTML() {
        const section = document.createElement("div");
        const h3 = document.createElement("h3");
        h3.textContent = this.obtenerNombreCiudad();

        const pPais = document.createElement("p");
        pPais.textContent = `País: ${this.obtenerNombrePais()}`;

        const pCoords = document.createElement("p");
        const [lat, lon, alt] = this.#coordenadas;
        pCoords.textContent = `Coordenadas: Latitud ${lat}, Longitud ${lon}, Altitud ${alt} m`;

        section.append(h3, pPais, this.obtenerInfoSecundaria(), pCoords);
        return section;
    }

    // -------------------------------
    // Meteorología del día de la carrera
    // -------------------------------
    async getMeteorologiaCarrera(fecha, section) {
        // Limpiar contenido previo
        section.innerHTML = "";

        // Agregar título
        const titulo = document.createElement("h3");
        titulo.textContent = "Datos del día de la carrera";
        section.appendChild(titulo);

        // Obtener coordenadas
        const [lat, lon] = this.#coordenadas;

        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${fecha}&end_date=${fecha}&hourly=temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m&timezone=Europe/Madrid`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            // Buscar la hora 14:00
            const horaIndex = data.hourly.time.findIndex(t => t.endsWith("14:00"));
            if (horaIndex === -1) {
                const p = document.createElement("p");
                p.textContent = "No hay datos disponibles a las 14:00.";
                section.appendChild(p);
                return;
            }

            const p = document.createElement("p");
            p.textContent = `2025-06-06 → 14:00 → Temperatura: ${data.hourly.temperature_2m[horaIndex]} °C, 
                Lluvia: ${data.hourly.precipitation[horaIndex]} mm, 
                Viento: ${data.hourly.wind_speed_10m[horaIndex]} km/h, 
                Humedad: ${data.hourly.relative_humidity_2m[horaIndex]} %`;
            section.appendChild(p);

        } catch (error) {
            console.error("Error al obtener meteorología:", error);
            const p = document.createElement("p");
            p.textContent = "No se pudieron cargar los datos meteorológicos.";
            section.appendChild(p);
        }
    }




    procesarJSONCarrera(datos) {
        if (!datos || !datos.hourly || !datos.daily) return null;

        const meteorologia = {
            diario: {
                amanecer: datos.daily.sunrise[0],
                atardecer: datos.daily.sunset[0]
            },
            horario: []
        };

        datos.hourly.time.forEach((hora, i) => {
            meteorologia.horario.push({
                hora,
                temperatura: datos.hourly.temperature_2m[i],
                sensacion: datos.hourly.apparent_temperature[i],
                lluvia: datos.hourly.rain[i],
                humedad: datos.hourly.relative_humidity_2m[i],
                vientoVel: datos.hourly.wind_speed_10m[i],
                vientoDir: datos.hourly.wind_direction_10m[i]
            });
        });

        this.meteorologiaCarrera = meteorologia;
        return meteorologia;
    }

    // -------------------------------
    // Meteorología de entrenamientos
    // -------------------------------
    async getMeteorologiaEntrenos(startDate, endDate, contenedor) {
        const [lat, lon] = this.#coordenadas;

        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,rain,wind_speed_10m,relative_humidity_2m&timezone=Europe/Madrid`;

        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error("Error HTTP");
            const datos = await resp.json();
            const medias = this.procesarJSONEntrenos(datos);
            this.mostrarMeteorologiaHTML(medias, contenedor, "Medias de entrenamientos");
        } catch (e) {
            console.error("Error al obtener datos meteorológicos de entrenamientos.", e);
            alert("No se pudieron cargar los datos meteorológicos de entrenamientos.");
        }
    }

    procesarJSONEntrenos(datos) {
        if (!datos || !datos.hourly) return null;

        const dias = {};

        datos.hourly.time.forEach((t, i) => {
            const dia = t.split("T")[0];
            if (!dias[dia]) dias[dia] = { temperatura: [], lluvia: [], viento: [], humedad: [] };
            dias[dia].temperatura.push(datos.hourly.temperature_2m[i]);
            dias[dia].lluvia.push(datos.hourly.rain[i]);
            dias[dia].viento.push(datos.hourly.wind_speed_10m[i]);
            dias[dia].humedad.push(datos.hourly.relative_humidity_2m[i]);
        });

        const medias = {};
        for (const d in dias) {
            medias[d] = {
                temperatura: (dias[d].temperatura.reduce((a, b) => a + b, 0) / dias[d].temperatura.length).toFixed(2),
                lluvia: (dias[d].lluvia.reduce((a, b) => a + b, 0) / dias[d].lluvia.length).toFixed(2),
                viento: (dias[d].viento.reduce((a, b) => a + b, 0) / dias[d].viento.length).toFixed(2),
                humedad: (dias[d].humedad.reduce((a, b) => a + b, 0) / dias[d].humedad.length).toFixed(2)
            };
        }

        this.meteorologiaEntrenos = medias;
        return medias;
    }

    // -------------------------------
    // Mostrar meteorología en HTML
    // -------------------------------
    mostrarMeteorologiaHTML(meteorologia, contenedor, titulo) {
        contenedor.innerHTML = ""; // limpiar contenido previo
        const h3 = document.createElement("h3");
        h3.textContent = titulo;
        contenedor.appendChild(h3);

        if (meteorologia?.diario) {
            const p1 = document.createElement("p");
            p1.textContent = `Amanecer: ${meteorologia.diario.amanecer}`;
            const p2 = document.createElement("p");
            p2.textContent = `Puesta de sol: ${meteorologia.diario.atardecer}`;
            contenedor.append(p1, p2);
        }

        if (meteorologia?.horario) {
            meteorologia.horario.forEach(h => {
                const p = document.createElement("p");
                p.textContent = `${h.hora} → Temp: ${h.temperatura} °C, Sensación: ${h.sensacion ?? "-"} °C, Lluvia: ${h.lluvia} mm, Humedad: ${h.humedad}%, Viento: ${h.vientoVel ?? "-"} km/h`;
                contenedor.appendChild(p);
            });
        } else if (!meteorologia?.horario && !meteorologia?.diario) {
            for (const dia in meteorologia) {
                const m = meteorologia[dia];
                const p = document.createElement("p");
                p.innerHTML = `<strong>${dia}</strong>`;
                const ul = document.createElement("ul");
                ul.innerHTML = `
                    <li>Temperatura media: ${m.temperatura} °C</li>
                    <li>Lluvia media: ${m.lluvia} mm</li>
                    <li>Viento medio: ${m.viento} km/h</li>
                    <li>Humedad media: ${m.humedad} %</li>
                `;
                contenedor.append(p, ul);
            }
        }
    }
}
