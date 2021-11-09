<?php
    header('Content-type: text/html; charset=utf-8');

    function scrap($html, $regex, $full=false) {
        $results = array();
        preg_match_all($regex, $html, $output);
        if (isset($output[1])) {
            foreach ($output[1] as $chunk) {
                $results[] = $chunk;
            }
        }
        return $results;
    }

    $project_url = isset($_POST['project_url']) ? $_POST['project_url'] : '';
    $regex = array(
        'html' => '/href="([^"]+.html)"/s',
        'jpg' => '/src="([^"]+.jpg)"/s',
        'title' => '/<a[^>]+>([^<]+)<\/a>/s',
    );
    $data = array();
    if ($project_url) {
        $project_html = file_get_contents($project_url);
        $links = scrap($project_html, $regex['html']);
        $titles = scrap($project_html, $regex['title']);
        if (sizeof($links) == sizeof($titles)) {
            foreach ($links as $k=>$link) {
                $view_url = $project_url.$link;
                $images = scrap(file_get_contents($view_url), $regex['jpg']);
                if ($images) {
                    $data[] = array(
                        $titles[$k],
                        str_replace('index.html', '', $view_url).$images[0]
                    );
                }
            }
            if (!sizeof($links) == sizeof($data)) {
                die("Scrap results invalid");
            }
        }
        else {
            die("Regex error");
        }
    }
    else if (isset($_POST['file_name']) && isset($_POST['file_data'])) {
        file_put_contents('projects/'.$_POST['file_name'].'.json', $_POST['file_data']);
        header('Location: ./');
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projects parser</title>
</head>
<body>
    
    <?php
    if ($data) {
        echo '<form action="" method="POST" style="margin-bottom: 60px">';
        echo '<textarea name="file_data" style="margin:0px;width:100%;min-height:200px;padding:20px;box-sizing:border-box;margin-bottom:20px;">'.json_encode($data).'</textarea>';
        echo '<br><input type="text" name="file_name" placeholder="File name" required pattern="^[A-Za-z0-9_]{1,32}$"><br>';
        echo '<br><button type="submit">Save to JSON file</button>';
        echo '</form>';
    }
    echo '<form action="" method="POST"><label>Project url:</label> <input type="text" name="project_url" required> <button type="submit">Submit</button></form>';
    echo '<br><a href="./">Back to list</a>';
    ?>
</body>
</html>