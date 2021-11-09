<?php
    require_once("autoload.php");
    $project_name = Tools::getField('project');
    $file = "projects/$project_name.json";

    // HOME PAGE
    if (!$project_name || !file_exists($file)) {
        $projects = array_diff(scandir("projects"), array('.', '..'));
        echo '<h3>Projects list</h3><ul>';
        foreach ($projects as $project) {
            $project = str_replace('.json', '', $project);
            echo '<li><a href="?project='.$project.'">'.$project.'</a></li>';
        }
        echo '</ul>';
        echo '<h3>Scraper</h3><ul><li><a href="scraper.php">Project scraper</a></li></ul>';
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
    <link rel="stylesheet" type="text/css" href="resources/css/styles.css">
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

    <script src="resources/js/jquery-3.6.0.min.js"></script>
    <script src="main.js" type="module"></script>

</body>
</html>