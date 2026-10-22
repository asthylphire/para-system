<?php
// GET api/auth/me.php -> who is logged in + a CSRF token.
// Call this on every page load; send the token as header X-CSRF-Token on all POSTs.
require_once __DIR__ . '/../helpers.php';
require_method('GET');
$uidBefore = $_SESSION['user_id'] ?? null;

$user = null;
if (!empty($_SESSION['user_id'])) {
    $s = db()->prepare('SELECT id, name, email FROM users WHERE id = ?');
    $s->execute([$_SESSION['user_id']]);
    $user = $s->fetch() ?: null;
    if (!$user) unset($_SESSION['user_id']);
}
ok(['loggedIn' => $user !== null, 'user' => $user, 'csrf' => csrf_token(), 'debug' => ['sid' => substr(session_id(), 0, 8,), 'uid' => $_SESSION['user_id' ?? null, 'hadUid' => !empty($uidBefore)]]);
