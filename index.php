<?php
    require_once("autoload.php");
    $project_name = Tools::getField('project');
    $file = "projects/$project_name.json";

    // HOME PAGE
    if (!$project_name || !file_exists($file)) {
        $projects = array_diff(scandir("projects"), array('.', '..'));
        foreach ($projects as $project) {
            $project = str_replace('.json', '', $project);
            echo '<a href="?project='.$project.'">'.$project.'</a><br>';
        }
        die();
    }
    // PROJECT PAGE
    else {
        $images = json_decode(file_get_contents("projects/$project_name.json"));
        Tools::addJS('images', $images);
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projects Viewer</title>
    <link rel="stylesheet" type="text/css" href="styles.css">
</head>
<body>
    
    <div class="container">
        <aside>
            <nav>
            <?php
                echo '<select class="changeImage">';
                foreach ($images as $k=>$image) {
                    echo '<option value="'.$k.'">'.$image[0].'</option>';
                }
                echo '</select>';

                echo '<ul>';
                    echo '<li>LeftMouseButton - move view in both direction</li>';
                    echo '<li>MouseWheel - move view in vertical direction</li>';
                    echo '<li>SHIFT + MouseWheel - zoom view</li>';
                echo '</ul>';
            ?>
            </nav>
        </aside>
        <main>
            <canvas id="canvas"></canvas>
        </main>
    </div>

    <script src="jquery-3.6.0.min.js"></script>
    <script src="app.js"></script>

</body>
</html>