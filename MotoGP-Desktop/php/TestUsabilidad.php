<?php

class TestUsabilidad
{
    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function iniciar(Crono $cronometro)
    {
        $cronometro->arrancar();
        $_SESSION["inicio"] = time();
    }

    public function comprobarReset()
    {
        if (!isset($_POST["iniciar"]) && !isset($_POST["terminar"])) {
            $this->resetSesion();
        }
    }

    public function terminar(Crono $cronometro, Configuracion $config)
    {
        $cronometro->parar();
        $tiempo = $cronometro->obtenerSegundos();

        // ---- GUARDAR USUARIO ----
        $u = $_SESSION["datos_usuario"];

        $idUsuario = $config->guardarUsuario(
            $u["nombre"],
            $u["genero"],
            $u["edad"],
            $u["profesion"],
            $u["pericia"]
        );
        if (!isset($_SESSION["datos_usuario"])) {
            return "Error: No se han guardado los datos del usuario.";
        }

        // ---- RESTO DE DATOS ----
        $dispositivo = 1;
        $completado = 1;

        $comentarios = $_POST['comentarios'] ?? "";
        $propuestas = $_POST['propuestas'] ?? "";
        $valoracion = $_POST['valoracion'] ?? 0;

        // ---- GUARDAR RESULTADO ----
        $idResultado = $config->guardarResultado(
            $idUsuario,
            $dispositivo,
            $tiempo,
            $completado,
            $comentarios,
            $propuestas,
            $valoracion
        );

        if (!$idResultado) {
            return "Error al guardar el resultado.";
        }

        // ---- GUARDAR RESPUESTAS ----
        for ($i = 1; $i <= 10; $i++) {
            $respuesta = $_POST["p$i"] ?? "";
            $config->guardarRespuesta($idResultado, $i, $respuesta);
        }

        // ---- RESET ----
        $this->resetSesion();

        return "Prueba finalizada. Datos del usuario y resultados guardados correctamente.";
    }



    private function resetSesion()
    {
        unset(
            $_SESSION["inicio"],
            $_SESSION["cronometro_start"],
            $_SESSION["cronometro_running"],
            $_SESSION["cronometro_elapsed"]
        );
    }

    public function pruebaIniciada()
    {
        return isset($_SESSION["inicio"]);
    }

    public function guardarDatosUsuario(Configuracion $config)
    {
        if (!isset($_POST["nombre"])) {
            return;
        }

        // --- PROFESIÓN ---
        $nombreProfesion = trim($_POST["profesion"]);
        $idProfesion = $config->obtenerIdProfesion($nombreProfesion);

        if (!$idProfesion) {
            // La profesión no existe → crearla
            $idProfesion = $config->crearProfesion($nombreProfesion);
        }

        // --- GÉNERO ---
        $generoTexto = $_POST["genero"] ?? "";
        switch (strtolower($generoTexto)) {
            case "hombre":
                $idGenero = 1;
                break;
            case "mujer":
                $idGenero = 2;
                break;
            case "otro":
                $idGenero = 3;
                break;
            default:
                $idGenero = null; // o 3 como valor por defecto
        }
        // --- DATOS DEL USUARIO EN SESIÓN ---
        $_SESSION["datos_usuario"] = [
            "nombre" => $_POST["nombre"],
            "genero" => $idGenero,
            "edad" => $_POST["edad"],
            "profesion" => $idProfesion,
            "pericia" => $_POST["pericia"]
        ];
    }


}
