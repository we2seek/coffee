<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once(__DIR__.'/db_coffee_config.php');

if (!isset($_POST['timer'])) {
    header("HTTP/1.0 400 Bad Request. There are no required POST parameter.");
    exit;
}

$seconds = (int)$_POST["timer"];

define('TIMEZONE', 'Europe/Kiev');
date_default_timezone_set(TIMEZONE);

// to set timezone in mysql: SET time_zone='offset';
// where offset is a string value representing the difference to UTC/GMT,
// e.g. ‘-4:00′, ‘+3:00′, ‘+10:30′, etc. Note that the +/- sign is essential
// — even for zero — and timezone offsets are not necessarily a whole hour.

// create a new DateTime object, find the offset in seconds, and convert it to minutes
$now = new DateTime();
$mins = $now->getOffset() / 60;

// We can now calculate whole hours and minutes. The first line determines whether the offset is positive or negative,
// then converts the value to a positive number to make the calculation easier
$sgn = ($mins < 0 ? -1 : 1);
$mins = abs($mins);
$hrs = floor($mins / 60);
$mins -= $hrs * 60;

$offset = sprintf('%+d:%02d', $hrs*$sgn, $mins);

try {
    $dsn = "mysql:host=$host;dbname=$database;charset=utf8";
    $opt = array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    );
    $db = new PDO($dsn, $user, $pass, $opt);
    $db->exec("SET time_zone='$offset';");

    // add new record
    if ($seconds > 0) {
        $sql = "INSERT INTO `". $table ."` (seconds) VALUES (:seconds)";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(":seconds", $seconds);
        $stmt->execute();
    }

    // records list
    $sql = "SELECT DATE_FORMAT(`date`, '%Y.%m.%d %H:%i') AS `date`, `seconds` FROM `". $table ."` ORDER BY `date` DESC LIMIT 10";
    $stmt = $db->prepare($sql);
    $stmt->execute();

    $records = $stmt->fetchAll();

    // top result
    $stmt = $db->prepare("SELECT DATE_FORMAT(`date`, '%Y.%m.%d %H:%i') AS `date`, `seconds` FROM `". $table ."` ORDER BY `seconds` DESC LIMIT 3");
    $stmt->execute();
    $top = $stmt->fetchAll();
    // print_r($top); exit();
    $return = array();
    
    if (isset($top)) {
        $return["top"] = $top;
    }

    if (isset($records)) {
        $return["records"] = $records;
    }

    echo json_encode($return);

} catch (PDOException $e) {
    echo $e->getMessage();
}

$db = null;