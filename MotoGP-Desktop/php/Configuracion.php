<?php
require_once "Config.php";
require_once "ControlesConfig.php";

$config = new Configuracion();
$admin = new ControlesConfig($config);

$mensaje = $admin->procesarAccion();
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuración Test - MotoGP</title>
    <link rel="stylesheet" href="../estilo/estilo.css">
    <link rel="stylesheet" href="../estilo/layout.css">
</head>

<body>
    <main>
        <h1>Configuración del Test de Usabilidad</h1>

        <form method="post">
            <fieldset>
                <legend>Acciones disponibles</legend>

                <button type="submit" name="reiniciar" class="button">Reiniciar Base de Datos</button>
                <button type="submit" name="eliminar" class="button">Eliminar Base de Datos</button>
                <button type="submit" name="exportar" class="button">Exportar Datos a CSV</button>
            </fieldset>
        </form>

        <?php if ($mensaje): ?>
            <p><?= htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8'); ?></p>
        <?php endif; ?>
    </main>
</body>

</html>
