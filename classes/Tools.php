<?php
class Tools {
    public static function addJS($key, $data) : void {
        echo '<script>const '.$key.'='.json_encode($data).'</script>';
    }
    public static function getField($name) {
        if (isset($_POST[$name])) {
            return $_POST[$name];
        }
        if (isset($_GET[$name])) {
            return $_GET[$name];
        }
        return null;
    }
}