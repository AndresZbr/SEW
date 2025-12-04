<?php
require_once "Crono.php";
require_once "Config.php";
require_once "TestUsabilidad.php";

$test = new TestUsabilidad();
$config = new Configuracion();
$cronometro = new Crono();
$mensaje = "";

$test->comprobarReset();

if (isset($_POST["iniciar"])) {
    $test->iniciar($cronometro);
}

if (isset($_POST["terminar"])) {
    $test->guardarDatosUsuario($config);
    $mensaje = $test->terminar($cronometro, $config);
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Prueba de Usabilidad - Cronómetro</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="../estilo/estilo.css">
    <link rel="stylesheet" href="../estilo/layout.css">
</head>

<body>
    <header>
        <h1>Prueba de Usabilidad</h1>
    </header>

    <main>

        <?php if (!$test->pruebaIniciada()): ?>

            <section>
                <form method="post">
                    <button type="submit" name="iniciar">Iniciar prueba</button>
                </form>
            </section>

        <?php else: ?>

            <section>
                <form method="post">

                    <!-- DATOS DEL USUARIO -->

                    <p>
                        <label>Nombre:</label>
                        <input type="text" name="nombre" required>
                    </p>

                    <p>
                        <label>Género:</label>
                        <select name="genero" required>
                            <option value="">Seleccionar...</option>
                            <option value="Hombre">Hombre</option>
                            <option value="Mujer">Mujer</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </p>

                    <p>
                        <label>Edad:</label>
                        <input type="number" name="edad" min="1" max="120" required>
                    </p>

                    <p>
                        <label>Profesión:</label>
                        <input type="text" name="profesion" required>
                    </p>

                    <p>
                        <label>Pericia informática (0–10):</label>
                        <input type="number" name="pericia" min="0" max="10" required>
                    </p>


                    <!-- PREGUNTAS DEL TEST -->
                    <fieldset>
                        <legend>Preguntas del Test</legend>
                        <ol>
                            <?php
                            $preguntas = [
                                "¿Qué piloto lidera el mundial actualmente?",
                                "¿De dónde es Chantra?",
                                "¿Cuántos metros tiene Motorland?",
                                "¿Cómo fue el tiempo durante el fin de semana de carrera?",
                                "¿Qué es una pole?",
                                "¿Qué es un chasis?",
                                "¿Cuántas marcas hay en el mundial?",
                                "¿Cuánto tardó Marc en terminar la carrera del domingo?",
                                "¿Cuál es la población más cercana al circuito?",
                                "¿Cuántos habitantes tiene la población más cercana?"
                            ];
                            foreach ($preguntas as $i => $pregunta): ?>
                                <li>
                                    <label><?= htmlspecialchars($pregunta) ?></label>
                                    <input type="text" name="p<?= $i + 1 ?>" required>
                                </li>
                            <?php endforeach; ?>
                        </ol>
                    </fieldset>

                    <!-- COMENTARIOS -->
                    <fieldset>
                        <legend>Comentarios y valoración</legend>

                        <p>
                            <label>Comentarios:</label><br>
                            <textarea name="comentarios" rows="3"></textarea>
                        </p>

                        <p>
                            <label>Propuestas:</label><br>
                            <textarea name="propuestas" rows="3"></textarea>
                        </p>

                        <p>
                            <label>Valoración:</label>
                            <input type="number" name="valoracion" min="0" max="10">
                        </p>
                    </fieldset>

                    <button type="submit" name="terminar">Terminar prueba</button>

                </form>

            </section>

        <?php endif; ?>

        <?php if ($mensaje): ?>
            <section>
                <p><strong><?= htmlspecialchars($mensaje) ?></strong></p>
            </section>
        <?php endif; ?>

    </main>

</body>

</html>