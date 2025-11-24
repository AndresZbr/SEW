<?php
session_start();
class Cronometro
{
    public function __construct()
    {
        if (!isset($_SESSION['cronometro_elapsed'])) {
            $_SESSION['cronometro_elapsed'] = 0.0;
        }
        if (!isset($_SESSION['cronometro_running'])) {
            $_SESSION['cronometro_running'] = false;
        }
        if (!isset($_SESSION['cronometro_start'])) {
            $_SESSION['cronometro_start'] = null;
        }
    }

    public function arrancar()
    {
        if (!$_SESSION['cronometro_running']) {
            $_SESSION['cronometro_start'] = microtime(true);
            $_SESSION['cronometro_running'] = true;
        }
    }

    public function parar()
    {
        if ($_SESSION['cronometro_running']) {
            $_SESSION['cronometro_elapsed'] += microtime(true) - $_SESSION['cronometro_start'];
            $_SESSION['cronometro_running'] = false;
            $_SESSION['cronometro_start'] = null;
        }
        return $_SESSION['cronometro_elapsed'];
    }

    private function tiempoActual()
    {
        if ($_SESSION['cronometro_running']) {
            return $_SESSION['cronometro_elapsed'] + (microtime(true) - $_SESSION['cronometro_start']);
        }
        return $_SESSION['cronometro_elapsed'];
    }

    public function mostrar()
    {
        $total = $this->tiempoActual();
        $minutos = floor($total / 60);
        $segundos = floor($total % 60);
        $decimas = floor(($total - floor($total)) * 10);
        return sprintf('%d:%02d:%d', $minutos, $segundos, $decimas);
    }
}
$cronometro = new Cronometro();

echo "
        <head>
            <title>MotoGP-ayuda</title>
            <link rel='stylesheet' type='text/css' href='estilo/layout.css' />
            <link rel='stylesheet' type='text/css' href='estilo/estilo.css' />
            <script src='js/menu.js' defer></script>
        </head>
        <header>
            <h1><a href='index.html' title='Ir a la pagina principal'>MotoGP Desktop</a></h1>   
            <button type='button' aria-label='Abrir menú' aria-expanded='false' aria-haspopup='true'>☰ Menú</button>
            <nav data-open='false' aria-label='Navegación principal'>
                <a href='index.html' title='Inicio de MotoGP-Desktop'>Inicio</a>
                <a href='piloto.html' title='Información del piloto'>Piloto</a>
                <a href='circuito.html' title='Información del circuito'>Circuito</a>
                <a href='meteorologia.html' title='Meteorología de MotoGP-Desktop'>Meteorología</a>
                <a href='clasificaciones.html' title='Clasificaciones de MotoGP-Desktop'>Clasificaciones</a>
                <a href='juegos.html' title='Juegos de MotoGP-Desktop'>Juegos</a>
                <a href='ayuda.html' title='Ayuda de MotoGP-Desktop'>Ayuda</a>
            </nav>
        </header>
        <main>
            <p class='migas'>Estás en: <a href='index.html' title='Inicio de MotoGP-Desktop'>Inicio</a> &gt;&gt; <strong>cronometro</strong></p>
        
";

//Solo se ejecutará si se ha pulsado un botón
if (count($_POST)>0) 
    {   
        if(isset($_POST['arrancar'])) $cronometro->arrancar();
        if(isset($_POST['parar'])) $cronometro->parar();
        if(isset($_POST['mostrar'])) $cronometro->mostrar();
    }

echo "  
        <form action='#' method='post' name='botones'>
            <div>
                <input type = 'submit' class='button' name = 'arrancar' value = 'arrancar'/>
                <input type = 'submit' class='button' name = 'parar' value = 'parar'/>
                <input type = 'submit' class='button' name = 'mostrar' value = 'mostrar'/>
            </div>                  
        </form>
        <p>" . $cronometro->mostrar() . "</p> 
";



?>