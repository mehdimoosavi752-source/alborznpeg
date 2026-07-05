<?php
declare(strict_types=1);

const APP_ROOT = __DIR__ . '/..';

function app_config(): array
{
    static $config;
    if ($config !== null) {
        return $config;
    }

    $path = APP_ROOT . '/config.php';
    if (!is_file($path)) {
        throw new RuntimeException('فایل config.php ساخته نشده است.');
    }

    $config = require $path;
    $required = [
        $config['db']['name'] ?? '',
        $config['db']['user'] ?? '',
        $config['db']['pass'] ?? '',
        $config['admin']['email'] ?? '',
        $config['admin']['password'] ?? '',
    ];
    foreach ($required as $value) {
        if ($value === '' || str_starts_with((string)$value, 'YOUR_') || str_starts_with((string)$value, 'CHANGE_')) {
            throw new RuntimeException('ابتدا مشخصات دیتابیس و مدیر را در فایل config.php وارد کنید.');
        }
    }
    return $config;
}

function db(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $db = app_config()['db'];
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $db['host'],
        $db['port'] ?? 3306,
        $db['name'],
        $db['charset'] ?? 'utf8mb4'
    );
    $pdo = new PDO($dsn, $db['user'], $db['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function start_app_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $settings = app_config()['session'] ?? [];
    session_name($settings['name'] ?? 'allameh_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => (bool)($settings['secure'] ?? true),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function ensure_schema(): void
{
    static $ready = false;
    if ($ready) {
        return;
    }

    $pdo = db();
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS app_users (
            uid VARCHAR(80) PRIMARY KEY,
            email VARCHAR(190) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'student',
            data JSON NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS app_documents (
            collection_name VARCHAR(80) NOT NULL,
            document_id VARCHAR(100) NOT NULL,
            data JSON NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (collection_name, document_id),
            INDEX idx_collection (collection_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $admin = app_config()['admin'];
    $email = strtolower(trim((string)$admin['email']));
    $check = $pdo->prepare('SELECT uid FROM app_users WHERE email = ? LIMIT 1');
    $check->execute([$email]);
    if (!$check->fetch()) {
        $uid = 'admin_' . bin2hex(random_bytes(8));
        $profile = [
            'uid' => $uid,
            'name' => $admin['name'] ?? 'مدیر آموزشگاه',
            'email' => $email,
            'role' => 'admin',
            'createdAt' => gmdate('c'),
            'grades' => new stdClass(),
        ];
        $insert = $pdo->prepare(
            'INSERT INTO app_users (uid, email, password_hash, role, data) VALUES (?, ?, ?, ?, ?)'
        );
        $insert->execute([
            $uid,
            $email,
            password_hash((string)$admin['password'], PASSWORD_DEFAULT),
            'admin',
            json_encode($profile, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    }

    $ready = true;
}

function json_response(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): never
{
    json_response(['message' => $message], $status);
}

function request_json(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    if (strlen($raw) > 24 * 1024 * 1024) {
        fail('حجم اطلاعات ارسالی بیش از حد مجاز است.', 413);
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail('فرمت اطلاعات ارسالی معتبر نیست.');
    }
    return $data;
}

function clean_user_row(?array $row): ?array
{
    if (!$row) {
        return null;
    }
    $data = json_decode((string)$row['data'], true) ?: [];
    $data['uid'] = $row['uid'];
    $data['email'] = $row['email'];
    $data['role'] = $row['role'];
    return $data;
}

function current_user(): ?array
{
    $uid = $_SESSION['uid'] ?? null;
    if (!$uid) {
        return null;
    }
    $stmt = db()->prepare('SELECT uid, email, role, data FROM app_users WHERE uid = ? LIMIT 1');
    $stmt->execute([$uid]);
    return clean_user_row($stmt->fetch() ?: null);
}

function require_user(): array
{
    $user = current_user();
    if (!$user) {
        fail('ابتدا وارد حساب کاربری شوید.', 401);
    }
    return $user;
}

function require_admin(): array
{
    $user = require_user();
    if (($user['role'] ?? '') !== 'admin') {
        fail('این بخش فقط برای مدیر قابل دسترسی است.', 403);
    }
    return $user;
}

function make_id(string $prefix): string
{
    $safe = preg_replace('/[^a-zA-Z0-9_-]/', '', $prefix) ?: 'doc';
    return $safe . '_' . dechex((int)(microtime(true) * 1000)) . '_' . bin2hex(random_bytes(4));
}

function valid_collection(string $name): bool
{
    return (bool)preg_match('/^[a-z][a-z0-9_]{1,79}$/', $name);
}

function get_document(string $collection, string $id): ?array
{
    if ($collection === 'users') {
        $stmt = db()->prepare('SELECT uid, email, role, data FROM app_users WHERE uid = ? LIMIT 1');
        $stmt->execute([$id]);
        return clean_user_row($stmt->fetch() ?: null);
    }
    $stmt = db()->prepare(
        'SELECT data FROM app_documents WHERE collection_name = ? AND document_id = ? LIMIT 1'
    );
    $stmt->execute([$collection, $id]);
    $row = $stmt->fetch();
    return $row ? (json_decode((string)$row['data'], true) ?: []) : null;
}

function save_document(string $collection, string $id, array $data): void
{
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $stmt = db()->prepare(
        'INSERT INTO app_documents (collection_name, document_id, data) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = CURRENT_TIMESTAMP'
    );
    $stmt->execute([$collection, $id, $json]);
}

function dotted_update(array &$target, array $changes): void
{
    foreach ($changes as $key => $value) {
        $parts = explode('.', (string)$key);
        $ref =& $target;
        foreach ($parts as $index => $part) {
            if ($index === count($parts) - 1) {
                $ref[$part] = $value;
                continue;
            }
            if (!isset($ref[$part]) || !is_array($ref[$part])) {
                $ref[$part] = [];
            }
            $ref =& $ref[$part];
        }
        unset($ref);
    }
}

function update_user_profile(string $uid, array $changes): void
{
    $stmt = db()->prepare('SELECT data, email, role FROM app_users WHERE uid = ? LIMIT 1');
    $stmt->execute([$uid]);
    $row = $stmt->fetch();
    if (!$row) {
        fail('کاربر پیدا نشد.', 404);
    }
    $profile = json_decode((string)$row['data'], true) ?: [];
    dotted_update($profile, $changes);
    $profile['uid'] = $uid;
    $profile['email'] = $row['email'];
    $profile['role'] = $row['role'];
    $update = db()->prepare('UPDATE app_users SET data = ? WHERE uid = ?');
    $update->execute([
        json_encode($profile, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        $uid,
    ]);
}
