// Clase Ciudad
class Ciudad {
  // Atributos
  nombre;
  pais;
  gentilicio;
  poblacion;
  coordenadas; // [latitud, longitud, altitud]

  // Constructor: recibe nombre, país y gentilicio
  constructor(nombre, pais, gentilicio) {
    this.nombre = nombre;
    this.pais = pais;
    this.gentilicio = gentilicio;
    this.poblacion = 0;
    this.coordenadas = [0, 0, 0]; // Inicialmente vacías
  }

  // Método para rellenar el resto de atributos
  rellenarDatos(poblacion, coordenadas) {
    this.poblacion = poblacion;
    this.coordenadas = coordenadas; // [lat, lon, alt]
  }

  // Método que devuelve el nombre de la ciudad
  obtenerNombreCiudad() {
    return this.nombre;
  }

  // Método que devuelve el nombre del país
  obtenerNombrePais() {
    return this.pais;
  }

  // Método que devuelve la información secundaria (gentilicio y población)
  obtenerInfoSecundaria() {
    return `
      <ul>
        <li>Gentilicio: ${this.gentilicio}</li>
        <li>Población: ${this.poblacion.toLocaleString()} habitantes</li>
      </ul>
    `;
  }

  // Método que escribe las coordenadas con document.write()
  mostrarCoordenadas() {
    document.write(
      `<p>Coordenadas: Latitud ${this.coordenadas[0]}, Longitud ${this.coordenadas[1]}, Altitud ${this.coordenadas[2]} m</p>`
    );
  }
}
