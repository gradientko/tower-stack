<?php
session_start();
if (!isset($_SESSION['tower_stack'])) {
  $_SESSION['tower_stack'] = ['high_score'=>0,'best_height'=>0,'games_played'=>0];
}
$stats = $_SESSION['tower_stack'];
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tower Stack — PHP</title>
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
<main class="shell">
<header class="hero">
  <div>
    <span class="eyebrow">PHP TOWER STACK</span>
    <h1>Build higher.</h1>
    <p>Stop each moving block over the tower. The overhanging part is cut away.</p>
  </div>
  <button id="restart" class="link-button">Restart</button>
</header>

<section class="stats">
  <div><span>Score</span><strong id="score">0</strong></div>
  <div><span>Best</span><strong id="best"><?= (int)$stats['high_score'] ?></strong></div>
  <div><span>Height</span><strong id="height">1</strong></div>
  <div><span>Combo</span><strong id="combo">0×</strong></div>
</section>

<section class="layout">
  <div class="game-wrap">
    <canvas id="game" width="840" height="720"></canvas>
    <div class="overlay" id="overlay">
      <span class="eyebrow" id="overlay-kicker">READY</span>
      <h2 id="overlay-title">Stack the tower.</h2>
      <p id="overlay-copy">Click, tap or press Space to drop the moving block.</p>
      <button id="start">Start game</button>
    </div>
  </div>

  <aside class="side">
    <section class="panel">
      <span class="eyebrow">STATUS</span>
      <strong id="status-title">Ready</strong>
      <p id="status-copy">Perfect placements build combo and restore a little width.</p>
    </section>
    <section class="legend">
      <div><i class="perfect"></i><span>Perfect</span><strong>combo</strong></div>
      <div><i class="good"></i><span>Overlap</span><strong>stack</strong></div>
      <div><i class="miss"></i><span>Miss</span><strong>end</strong></div>
    </section>
    <button id="drop" class="primary">DROP BLOCK</button>
    <button id="pause" class="secondary">Pause</button>
  </aside>
</section>

<footer><span>Canvas physics · slicing · PHP sessions</span><span>tower-stack</span></footer>
</main>

<script>
window.TOWER_STATS = <?= json_encode([
  'highScore'=>(int)$stats['high_score'],
  'bestHeight'=>(int)$stats['best_height'],
  'gamesPlayed'=>(int)$stats['games_played']
]) ?>;
</script>
<script src="assets/app.js"></script>
</body>
</html>
