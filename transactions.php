<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { jsonResponse([]); }

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

// ── CSV export ────────────────────────────────────────────────────────────────
if ($method === 'GET' && isset($_GET['export']) && $_GET['export'] === 'csv') {
    $month = $_GET['month'] ?? null;
    $sql   = "SELECT t.date, t.type, c.name AS category, t.amount, t.note
              FROM transactions t
              LEFT JOIN categories c ON c.id = t.category_id";
    $params = [];
    if ($month) {
        $sql    .= " WHERE strftime('%Y-%m', t.date) = ?";
        $params[] = $month;
    }
    $sql .= " ORDER BY t.date DESC";
    $rows = $db->prepare($sql);
    $rows->execute($params);

    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="transactions.csv"');
    header('Access-Control-Allow-Origin: *');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['Date','Type','Category','Amount','Note']);
    foreach ($rows->fetchAll() as $row) fputcsv($out, $row);
    fclose($out);
    exit;
}

// ── GET list ──────────────────────────────────────────────────────────────────
if ($method === 'GET' && !$id) {
    $where  = [];
    $params = [];

    if (!empty($_GET['type'])) {
        $where[] = 't.type = ?';
        $params[] = $_GET['type'];
    }
    if (!empty($_GET['category_id'])) {
        $where[] = 't.category_id = ?';
        $params[] = (int)$_GET['category_id'];
    }
    if (!empty($_GET['month'])) {
        $where[] = "strftime('%Y-%m', t.date) = ?";
        $params[] = $_GET['month'];
    }
    if (!empty($_GET['search'])) {
        $where[] = "(t.note LIKE ? OR c.name LIKE ?)";
        $params[] = '%' . $_GET['search'] . '%';
        $params[] = '%' . $_GET['search'] . '%';
    }

    $sql = "SELECT t.*, c.name AS category_name, c.colour AS category_colour, c.icon AS category_icon
            FROM transactions t
            LEFT JOIN categories c ON c.id = t.category_id";
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY t.date DESC, t.created_at DESC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    jsonResponse($stmt->fetchAll());
}

// ── GET single ────────────────────────────────────────────────────────────────
if ($method === 'GET' && $id) {
    $stmt = $db->prepare("SELECT * FROM transactions WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) errorResponse('Not found', 404);
    jsonResponse($row);
}

// ── POST create ───────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $b = getBody();
    if (empty($b['amount']) || empty($b['type']) || empty($b['date']))
        errorResponse('amount, type and date are required');

    $stmt = $db->prepare(
        "INSERT INTO transactions (amount, type, category_id, date, note)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        (float)$b['amount'],
        $b['type'],
        $b['category_id'] ?? null,
        $b['date'],
        $b['note'] ?? '',
    ]);
    $newId = $db->lastInsertId();
    $row   = $db->prepare("SELECT t.*, c.name AS category_name, c.colour AS category_colour, c.icon AS category_icon
                            FROM transactions t LEFT JOIN categories c ON c.id = t.category_id WHERE t.id = ?");
    $row->execute([$newId]);
    jsonResponse($row->fetch(), 201);
}

// ── PUT update ────────────────────────────────────────────────────────────────
if ($method === 'PUT' && $id) {
    $b = getBody();
    $stmt = $db->prepare(
        "UPDATE transactions SET amount=?, type=?, category_id=?, date=?, note=? WHERE id=?"
    );
    $stmt->execute([
        (float)($b['amount'] ?? 0),
        $b['type'] ?? 'expense',
        $b['category_id'] ?? null,
        $b['date'] ?? date('Y-m-d'),
        $b['note'] ?? '',
        $id,
    ]);
    if ($stmt->rowCount() === 0) errorResponse('Not found', 404);
    $row = $db->prepare("SELECT t.*, c.name AS category_name, c.colour AS category_colour, c.icon AS category_icon
                          FROM transactions t LEFT JOIN categories c ON c.id = t.category_id WHERE t.id = ?");
    $row->execute([$id]);
    jsonResponse($row->fetch());
}

// ── DELETE ────────────────────────────────────────────────────────────────────
if ($method === 'DELETE' && $id) {
    $stmt = $db->prepare("DELETE FROM transactions WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) errorResponse('Not found', 404);
    jsonResponse(['deleted' => true]);
}

errorResponse('Bad request');
