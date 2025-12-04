<?php

class ControlesConfig
{
    private $config;

    public function __construct(Configuracion $config)
    {
        $this->config = $config;
    }

    public function procesarAccion()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return "";
        }

        if (isset($_POST['reiniciar'])) {
            return $this->config->reiniciarBD();
        }

        if (isset($_POST['eliminar'])) {
            return $this->config->eliminarBD();
        }

        if (isset($_POST['exportar'])) {
            return $this->config->exportarCSV();
        }

        return "";
    }
}
