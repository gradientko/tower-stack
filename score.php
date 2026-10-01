<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
  http_response_code(400);
  echo json_encode(['error'=>'Invalid JSON']);
  exit;
}

$score = $input['score'] ?? null;
$height = $input['height'] ?? null;

if (!is_int($score) || !is_int($height) || $score < 0 || $height < 1) {
  http_response_code(422);
  echo json_encode(['error'=>'Invalid result']);
  exit;
}

if (!isset($_SESSION['tower_stack'])) {
  $_SESSION['tower_stack'] = ['high_score'=>0,'best_height'=>0,'games_played'=>0];
}

$_SESSION['tower_stack']['high_score'] = max($_SESSION['tower_stack']['high_score'], $score);
$_SESSION['tower_stack']['best_height'] = max($_SESSION['tower_stack']['best_height'], $height);
$_SESSION['tower_stack']['games_played']++;

echo json_encode([
  'ok'=>true,
  'highScore'=>$_SESSION['tower_stack']['high_score'],
  'bestHeight'=>$_SESSION['tower_stack']['best_height'],
  'gamesPlayed'=>$_SESSION['tower_stack']['games_played']
]);
