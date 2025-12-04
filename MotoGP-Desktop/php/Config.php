<?php

class Configuracion
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = new mysqli("localhost", "DBUSER2025", "DBPSWD2025", "uo300351_db");

        if ($this->conexion->connect_errno) {
            die("Error de conexión: " . $this->conexion->connect_error);
        }
    }

    public function guardarResultado($usuario, $dispositivo, $tiempo, $completado, $comentarios, $propuestas, $valoracion)
    {
        $stmt = $this->conexion->prepare(
            "INSERT INTO resultados 
        (id_usuario, id_dispositivo, tiempo_segundos, completado, comentarios, propuestas_mejora, valoracion)
        VALUES (?, ?, ?, ?, ?, ?, ?)"
        );

        $stmt->bind_param(
            "iiiissi",
            $usuario,
            $dispositivo,
            $tiempo,
            $completado,
            $comentarios,
            $propuestas,
            $valoracion
        );

        if ($stmt->execute()) {
            return $this->conexion->insert_id;   // ← ID del resultado recién insertado
        } else {
            return false;
        }
    }


    public function reiniciarBD()
    {
        $this->conexion->query("DELETE FROM usuarios");
        $this->conexion->query("ALTER TABLE usuarios AUTO_INCREMENT = 1");

        $this->conexion->query("DELETE FROM respuestas");
        $this->conexion->query("ALTER TABLE respuestas AUTO_INCREMENT = 1");

        $this->conexion->query("DELETE FROM resultados");
        $this->conexion->query("ALTER TABLE resultados AUTO_INCREMENT = 1");

        return "Base de datos reiniciada.";
    }


    public function eliminarBD()
    {
        $this->conexion->query("DROP TABLE IF EXISTS resultados");
        return "Tabla eliminada.";
    }

    public function exportarCSV()
    {
        $archivo = "../resultados_completo.csv";
        $fp = fopen($archivo, "w");

        if (!$fp) {
            return "No se pudo crear el archivo CSV.";
        }

        // Tablas a exportar y columnas
        $tablas = [
            "usuarios" => ["id_usuario", "nombre", "id_profesion", "edad", "id_genero", "pericia_informatica"],
            "profesiones" => ["id_profesion", "nombre"],
            "generos" => ["id_genero", "genero"],
            "dispositivos" => ["id_dispositivo", "nombre"],
            "resultados" => ["id_resultado", "id_usuario", "id_dispositivo", "tiempo_segundos", "completado", "comentarios", "propuestas_mejora", "valoracion"],
            "respuestas" => ["id_respuesta", "id_resultado", "numero_pregunta", "respuesta"],
            "observacionesfacilitador" => ["id_observacion", "id_usuario", "comentarios"]
        ];

        foreach ($tablas as $tabla => $columnas) {
            // Cabecera de tabla
            fputcsv($fp, ["=== TABLA: $tabla ==="]);
            fputcsv($fp, $columnas);

            $resultado = $this->conexion->query("SELECT * FROM $tabla ORDER BY " . $columnas[0]);

            if ($resultado) {
                while ($fila = $resultado->fetch_assoc()) {
                    $filaOrdenada = [];
                    foreach ($columnas as $col) {
                        $filaOrdenada[] = $fila[$col] ?? "";
                    }
                    fputcsv($fp, $filaOrdenada);
                }
            }

            fputcsv($fp, []); // línea vacía entre tablas
        }

        fclose($fp);

        return "Datos exportados en resultados_completo.csv de forma legible con IDs numéricos.";
    }



    public function guardarRespuesta($idResultado, $numeroPregunta, $respuesta)
    {
        $stmt = $this->conexion->prepare(
            "INSERT INTO respuestas (id_resultado, numero_pregunta, respuesta)
         VALUES (?, ?, ?)"
        );

        $stmt->bind_param("iis", $idResultado, $numeroPregunta, $respuesta);
        $stmt->execute();
    }

    public function guardarUsuario($nombre, $genero, $edad, $idProfesion, $pericia)
    {
        $stmt = $this->conexion->prepare(
            "INSERT INTO usuarios (nombre, genero, edad, profesion, pericia)
         VALUES (?, ?, ?, ?, ?)"
        );

        $stmt->bind_param("ssisi", $nombre, $genero, $edad, $idProfesion, $pericia);
        $stmt->execute();

        return $this->conexion->insert_id;
    }

    // Devuelve el id de la profesión si existe, o false si no
    public function obtenerIdProfesion($nombre)
    {
        $stmt = $this->conexion->prepare("SELECT id_profesion FROM profesiones WHERE nombre = ?");
        $stmt->bind_param("s", $nombre);
        $stmt->execute();
        $stmt->bind_result($id);
        if ($stmt->fetch()) {
            $stmt->close();
            return $id;
        }
        $stmt->close();
        return false;
    }

    // Crea una nueva profesión y devuelve el ID
    public function crearProfesion($nombre)
    {
        $stmt = $this->conexion->prepare("INSERT INTO profesiones (nombre) VALUES (?)");
        $stmt->bind_param("s", $nombre);
        $stmt->execute();
        $id = $this->conexion->insert_id;
        $stmt->close();
        return $id;
    }

}

?>