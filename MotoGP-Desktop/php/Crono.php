<?php

class Crono
{
    public function arrancar()
    {
        $_SESSION["cronometro_start"] = time();
        $_SESSION["cronometro_running"] = true;
    }

    public function parar()
    {
        if (isset($_SESSION["cronometro_running"]) && $_SESSION["cronometro_running"]) {
            $_SESSION["cronometro_elapsed"] = time() - $_SESSION["cronometro_start"];
            $_SESSION["cronometro_running"] = false;
        }
    }

    public function obtenerSegundos()
    {
        if (isset($_SESSION["cronometro_elapsed"])) {
            return $_SESSION["cronometro_elapsed"];
        }

        if (isset($_SESSION["cronometro_running"]) && $_SESSION["cronometro_running"]) {
            return time() - $_SESSION["cronometro_start"];
        }

        return 0;
    }
}
