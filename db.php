<?php
define('DB_PATH', __DIR__ . '/budget.db');

function getDB(): PDO {
    static $db = null;
    if ($db !== null) return $db;

    $db = new PDO('sqlite:' . DB_PATH);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $db->exec('PRAGMA journal_mode=WAL;');
    $db->exec('PRAGMA foreign_keys=ON;');

    $db->exec("
        CREATE TABLE IF NOT EXISTS categories (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            name    TEXT    NOT NULL,
            colour  TEXT    NOT NULL DEFAULT '#6366f1',
            icon    TEXT    NOT NULL DEFAULT '📦',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            amount      REAL    NOT NULL,
            type        TEXT    NOT NULL CHECK(type IN ('income','expense')),
            category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
            date        TEXT    NOT NULL,
            note        TEXT    NOT NULL DEFAULT '',
            created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS goals (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
            month        TEXT    NOT NULL,
            limit_amount REAL    NOT NULL,
            UNIQUE(category_id, month)
        );
    ");

    // Seed default categories if table is empty
    $count = $db->query('SELECT COUNT(*) FROM categories')->fetchColumn();
    if ((int)$count === 0) {
        $defaults = [
            ['Housing',      '#6366f1', '🏠'],
            ['Food',         '#10b981', '🍔'],
            ['Transport',    '#f59e0b', '🚗'],
            ['Health',       '#ec4899', '💊'],
            ['Entertainment','#8b5cf6', '🎮'],
            ['Shopping',     '#14b8a6', '🛍️'],
            ['Utilities',    '#f97316', '💡'],
            ['Salary',       '#22c55e', '💼'],
            ['Freelance',    '#06b6d4', '💻'],
            ['Other',        '#94a3b8', '📦'],
        ];
        $stmt = $db->prepare('INSERT INTO categories (name,colour,icon) VALUES (?,?,?)');
        foreach ($defaults as $d) $stmt->execute($d);
    }

    return $db;
}

function jsonResponse(mixed $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($data);
    exit;
}

function errorResponse(string $msg, int $status = 400): void {
    jsonResponse(['error' => $msg], $status);
}

function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw ?: '{}', true) ?? [];
}
