<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { jsonResponse([]); }

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

if ($method === 'GET' && !$id) {
    $rows = $db->query("SELECT * FROM categories ORDER BY name ASC")->fetchAll();
    jsonResponse($rows);
}

if ($method === 'GET' && $id) {
    $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) errorResponse('Not found', 404);
    jsonResponse($row);
}

if ($method === 'POST') {
    $b = getBody();
    if (empty($b['name'])) errorResponse('name is required');
    $stmt = $db->prepare("INSERT INTO categories (name, colour, icon) VALUES (?, ?, ?)");
    $stmt->execute([$b['name'], $b['colour'] ?? '#6366f1', $b['icon'] ?? '📦']);
    $newId = $db->lastInsertId();
    $row   = $db->prepare("SELECT * FROM categories WHERE id = ?");
    $row->execute([$newId]);
    jsonResponse($row->fetch(), 201);
}

if ($method === 'PUT' && $id) {
    $b = getBody();
    $stmt = $db->prepare("UPDATE categories SET name=?, colour=?, icon=? WHERE id=?");
    $stmt->execute([$b['name'] ?? '', $b['colour'] ?? '#6366f1', $b['icon'] ?? '📦', $id]);
    if ($stmt->rowCount() === 0) errorResponse('Not found', 404);
    $row = $db->prepare("SELECT * FROM categories WHERE id = ?");
    $row->execute([$id]);
    jsonResponse($row->fetch());
}

if ($method === 'DELETE' && $id) {
    $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) errorResponse('Not found', 404);
    jsonResponse(['deleted' => true]);
}

errorResponse('Bad request');
