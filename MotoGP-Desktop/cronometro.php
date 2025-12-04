<?php
// cronometro.php
session_start();

class Cronometro {

    public function __construct() {
        if (!isset($_SESSION['cronometro_running']))
            $_SESSION['cronometro_running'] = false;

        if (!isset($_SESSION['cronometro_start']))
            $_SESSION['cronometro_start'] = null;

        if (!isset($_SESSION['cronometro_elapsed']))
            $_SESSION['cronometro_elapsed'] = 0.0;
    }

    public function arrancar() {
        $_SESSION['cronometro_elapsed'] = 0.0;
        $_SESSION['cronometro_start'] = microtime(true);
        $_SESSION['cronometro_running'] = true;
    }

    public function parar() {
        if ($_SESSION['cronometro_running']) {
            $_SESSION['cronometro_elapsed'] = microtime(true) - $_SESSION['cronometro_start'];
            $_SESSION['cronometro_running'] = false;
            $_SESSION['cronometro_start'] = null;
        }
    }

    public function mostrar() {
        $total = $_SESSION['cronometro_running']
            ? microtime(true) - $_SESSION['cronometro_start']
            : $_SESSION['cronometro_elapsed'];

        $minutos  = floor($total / 60);
        $segundos = floor($total % 60);
        $decimas  = floor(($total - floor($total)) * 10);

        return sprintf("%d:%02d:%d", $minutos, $segundos, $decimas);
    }
}

$mensaje = "Tiempo actual: —";

// Procesar botones
if ($_SERVER['REQUEST_METHOD'] === 'POST' && count($_POST) > 0) 
{
    $cron = new Cronometro();

    if (isset($_POST['arrancar']))  $cron->arrancar();
    if (isset($_POST['parar']))     $cron->parar();
    if (isset($_POST['mostrar']))   $mensaje = "Tiempo actual: " . $cron->mostrar();
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>MotoGP - Cronómetro</title>
    <meta name="author" content="Andres Zhou Blanco Rodriguez" />
    <meta name="description" content="Juego de memoria con cartas de MotoGP" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Hojas de estilo (usa las tuyas) -->
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
            <a href="clasificaciones.php">Clasificaciones</a>
            <a href="juegos.html" class="active">Juegos</a>
            <a href="ayuda.html">Ayuda</a>
        </nav>
    </header>

    <main>
        <p class="migas">Estás en: <a href="index.html">Inicio</a> &gt;&gt;
            <a href="juegos.html">Juegos</a> &gt;&gt; <strong>Cronómetro PHP</strong>
        </p>

        <h3>Control del Cronómetro</h3>

        <!-- Formulario: método POST obligatorio para que PHP reciba los botones -->
        <form action="#" method="post">
            <fieldset>
                <input type="submit" name="arrancar" value="Arrancar" class="button" />
                <input type="submit" name="parar" value="Parar" class="button" />
                <input type="submit" name="mostrar" value="Mostrar" class="button" />
            </fieldset>
        </form>

        <p><?php echo htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8'); ?></p>
    </main>

    <footer>
        <p>&copy; MotoGP Desktop</p>
    </footer>
</body>

</html>
