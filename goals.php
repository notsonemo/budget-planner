<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { jsonResponse([]); }

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

// GET goals with progress for a given month
if ($method === 'GET' && !$id) {
    $month = $_GET['month'] ?? date('Y-m');

    $sql = "
        SELECT g.id, g.category_id, g.month, g.limit_amount,
               c.name AS category_name, c.colour AS category_colour, c.icon AS category_icon,
               COALESCE(SUM(t.amount), 0) AS spent
        FROM goals g
        JOIN categories c ON c.id = g.category_id
        LEFT JOIN transactions t
               ON t.category_id = g.category_id
              AND t.type = 'expense'
              AND strftime('%Y-%m', t.date) = g.month
        WHERE g.month = ?
        GROUP BY g.id
        ORDER BY c.name ASC
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute([$month]);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['percent'] = $row['limit_amount'] > 0
            ? round(($row['spent'] / $row['limit_amount']) * 100, 1)
            : 0;
    }
    jsonResponse($rows);
}

if ($method === 'GET' && $id) {
    $stmt = $db->prepare("SELECT * FROM goals WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) errorResponse('Not found', 404);
    jsonResponse($row);
}

if ($method === 'POST') {
    $b = getBody();
    if (empty($b['category_id']) || empty($b['month']) || !isset($b['limit_amount']))
        errorResponse('category_id, month and limit_amount are required');

    try {
        $stmt = $db->prepare(
            "INSERT INTO goals (category_id, month, limit_amount) VALUES (?, ?, ?)
             ON CONFLICT(category_id, month) DO UPDATE SET limit_amount = excluded.limit_amount"
        );
        $stmt->execute([(int)$b['category_id'], $b['month'], (float)$b['limit_amount']]);
    } catch (Exception $e) {
        errorResponse($e->getMessage());
    }

    $newId = $db->lastInsertId() ?: $db->query(
        "SELECT id FROM goals WHERE category_id = {$b['category_id']} AND month = '{$b['month']}'"
    )->fetchColumn();

    $row = $db->prepare("SELECT g.*, c.name AS category_name, c.colour AS category_colour, c.icon AS category_icon
                          FROM goals g JOIN categories c ON c.id = g.category_id WHERE g.id = ?");
    $row->execute([$newId]);
    jsonResponse($row->fetch(), 201);
}

if ($method === 'PUT' && $id) {
    $b = getBody();
    $stmt = $db->prepare("UPDATE goals SET limit_amount=? WHERE id=?");
    $stmt->execute([(float)($b['limit_amount'] ?? 0), $id]);
    if ($stmt->rowCount() === 0) errorResponse('Not found', 404);
    jsonResponse(['updated' => true]);
}

if ($method === 'DELETE' && $id) {
    $stmt = $db->prepare("DELETE FROM goals WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) errorResponse('Not found', 404);
    jsonResponse(['deleted' => true]);
}

errorResponse('Bad request');
