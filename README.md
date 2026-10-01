# tower-stack

A tower stacking game built with PHP sessions and vanilla JavaScript.

## Features

- moving blocks
- exact overlap calculation
- overhang slicing
- falling cut pieces
- perfect placement detection
- combo system
- small width recovery after perfect placements
- increasing speed
- vertical camera movement
- score and tower height
- pause / restart
- keyboard, mouse and touch controls
- PHP session high score
- best height tracking
- no framework
- no database

## Run

Requires PHP 8.1+.

```bash
php -S localhost:8000
```

Open:

```text
http://localhost:8000
```

## Controls

```text
Space / Enter   drop block
Click / Touch   drop block
P               pause
```

## Project structure

```text
tower-stack/
├── index.php
├── score.php
├── assets/
│   ├── app.js
│   └── style.css
└── README.md
```

GitHub Pages cannot execute PHP. Use PHP-capable hosting or a local PHP server.

## License

MIT
