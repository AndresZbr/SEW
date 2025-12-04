<?php
/**
 * Clase Clasificacion
 * Lee la información de circuitoEsquema.xml y muestra el ganador y la clasificación
 */
class Clasificacion
{
    private $documento;

    public function __construct()
    {
        // Ruta del archivo XML
        $this->documento = __DIR__ . '/xml/circuitoEsquema.xml';
    }

    /**
     * Consulta el archivo XML y devuelve el objeto SimpleXML
     */
    public function consultar()
    {
        if (!file_exists($this->documento)) {
            return false;
        }
        return simplexml_load_file($this->documento);
    }

    /**
     * Muestra el ganador de la carrera con tiempo formateado
     */
    public function mostrarGanador($xml)
    {
        if ($xml && isset($xml->vencedor)) {
            $nombre = htmlspecialchars((string) $xml->vencedor->nombre);
            $tiempo_iso = (string) $xml->vencedor->tiempo;

            // Convertimos PTxxMxxS a mm:ss
            preg_match('/PT(\d+)M(\d+)S/', $tiempo_iso, $matches);
            if ($matches) {
                $minutos = $matches[1];
                $segundos = $matches[2];
                $tiempo = sprintf('%02d:%02d', $minutos, $segundos);
            } else {
                $tiempo = htmlspecialchars($tiempo_iso);
            }
            return "<p>Ganador de la carrera: $nombre en $tiempo</p>";
        }
        return "<p>No se ha encontrado información del ganador.</p>";
    }

    /**
     * Muestra la clasificación del mundial tras la carrera
     */
    public function mostrarClasificacion($xml)
    {
        if ($xml && isset($xml->clasificacion->piloto)) {
            $html = "<h3>Clasificación del Mundial tras la carrera</h3><ol>";
            foreach ($xml->clasificacion->piloto as $piloto) {
                $nombre = htmlspecialchars((string) $piloto);
                $html .= "<li>$nombre</li>";
            }
            $html .= "</ol>";
            return $html;
        }
        return "<p>No se ha encontrado información de la clasificación.</p>";
    }
}

// Instanciación y lectura del XML
$clasificacion = new Clasificacion();
$xml = $clasificacion->consultar();
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>MotoGP - Clasificaciones</title>
    <meta name="author" content="Andres Zhou Blanco Rodriguez" />
    <meta name="description" content="Juego de memoria con cartas de MotoGP" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Hojas de estilo -->
    <link rel="stylesheet" href="estilo/estilo.css" />
    <link rel="stylesheet" href="estilo/layout.css" />
    <link rel="icon" href="multimedia/favicon.ico" />

</head>

<body>
    <header>
        <h1><a href="index.html">MotoGP Desktop</a></h1>
        <button>☰ Menú</button>
        <nav>
            <a href="index.html">Inicio</a>
            <a href="piloto.html">Piloto</a>
            <a href="circuito.html">Circuito</a>
            <a href="meteorologia.html">Meteorología</a>
            <a href="clasificaciones.php" class="active">Clasificaciones</a>
            <a href="juegos.html">Juegos</a>
            <a href="ayuda.html">Ayuda</a>
        </nav>
    </header>

    <main>
        <p>Estás en: Inicio</a> &gt;&gt; <strong>Clasificaciones</strong></p>
        <h2>Resultados de la carrera</h2>
        <?php echo $clasificacion->mostrarGanador($xml); ?>
        <?php echo $clasificacion->mostrarClasificacion($xml); ?>
    </main>
</body>

</html>