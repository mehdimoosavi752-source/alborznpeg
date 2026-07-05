<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

try {
    start_app_session();
    ensure_schema();

    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    $route = trim((string)($_GET['route'] ?? ''), '/');
    $parts = $route === '' ? [] : array_map('urldecode', explode('/', $route));

    if ($route === 'health' && $method === 'GET') {
        json_response(['ok' => true]);
    }

    if ($route === 'auth/login' && $method === 'POST') {
        $input = request_json();
        $email = strtolower(trim((string)($input['email'] ?? '')));
        $stmt = db()->prepare(
            'SELECT uid, email, role, data, password_hash FROM app_users WHERE email = ? LIMIT 1'
        );
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        if (!$row || !password_verify((string)($input['password'] ?? ''), $row['password_hash'])) {
            fail('ایمیل یا رمز عبور اشتباه است.', 401);
        }
        session_regenerate_id(true);
        $_SESSION['uid'] = $row['uid'];
        json_response(['user' => clean_user_row($row)]);
    }

    if ($route === 'auth/register' && $method === 'POST') {
        $input = request_json();
        $email = strtolower(trim((string)($input['email'] ?? '')));
        $password = (string)($input['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            fail('ایمیل معتبر وارد کنید.');
        }
        if (strlen($password) < 6) {
            fail('رمز عبور باید حداقل ۶ کاراکتر باشد.');
        }
        $check = db()->prepare('SELECT uid FROM app_users WHERE email = ? LIMIT 1');
        $check->execute([$email]);
        if ($check->fetch()) {
            fail('این ایمیل قبلاً ثبت شده است.', 409);
        }
        $uid = make_id('user');
        $profile = [
            'uid' => $uid,
            'name' => explode('@', $email)[0],
            'email' => $email,
            'role' => 'student',
            'createdAt' => gmdate('c'),
            'grades' => new stdClass(),
        ];
        $stmt = db()->prepare(
            'INSERT INTO app_users (uid, email, password_hash, role, data) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $uid,
            $email,
            password_hash($password, PASSWORD_DEFAULT),
            'student',
            json_encode($profile, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
        session_regenerate_id(true);
        $_SESSION['uid'] = $uid;
        json_response(['user' => $profile]);
    }

    if ($route === 'auth/me' && $method === 'GET') {
        json_response(['user' => current_user()]);
    }

    if ($route === 'auth/logout' && $method === 'POST') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], '', $params['secure'], true);
        }
        session_destroy();
        json_response(['ok' => true]);
    }

    if ($route === 'auth/change-password' && $method === 'POST') {
        $user = require_user();
        $input = request_json();
        $stmt = db()->prepare('SELECT password_hash FROM app_users WHERE uid = ? LIMIT 1');
        $stmt->execute([$user['uid']]);
        $row = $stmt->fetch();
        if (!$row || !password_verify((string)($input['currentPassword'] ?? ''), $row['password_hash'])) {
            fail('رمز عبور فعلی اشتباه است.', 401);
        }
        $newPassword = (string)($input['newPassword'] ?? '');
        if (strlen($newPassword) < 6) {
            fail('رمز جدید باید حداقل ۶ کاراکتر باشد.');
        }
        $update = db()->prepare('UPDATE app_users SET password_hash = ? WHERE uid = ?');
        $update->execute([password_hash($newPassword, PASSWORD_DEFAULT), $user['uid']]);
        json_response(['ok' => true]);
    }

    if (($parts[0] ?? '') !== 'collections') {
        fail('مسیر پیدا نشد.', 404);
    }

    $collection = (string)($parts[1] ?? '');
    $documentId = (string)($parts[2] ?? '');
    if (!valid_collection($collection)) {
        fail('نام مجموعه معتبر نیست.', 404);
    }

    $user = current_user();
    $isAdmin = ($user['role'] ?? '') === 'admin';
    $publicRead = ['toefl_dates', 'mock_dates', 'gre_dates', 'internal_exams', 'settings'];
    $private = [
        'exam_registrations',
        'course_registrations',
        'placement_registrations',
        'exam_submissions',
        'registration_assignments',
        'messages',
    ];
    $studentCreate = [
        'exam_registrations',
        'course_registrations',
        'placement_registrations',
        'exam_submissions',
        'messages',
    ];

    if ($collection === 'users') {
        if ($documentId === '' && $method === 'GET') {
            require_admin();
            $rows = db()->query('SELECT uid, email, role, data FROM app_users ORDER BY created_at DESC')->fetchAll();
            $items = [];
            foreach ($rows as $row) {
                $items[$row['uid']] = clean_user_row($row);
            }
            json_response(['items' => $items]);
        }
        if ($documentId === '') {
            fail('شناسه کاربر لازم است.', 400);
        }
        if (!$user || (!$isAdmin && $user['uid'] !== $documentId)) {
            fail('دسترسی مجاز نیست.', 403);
        }
        if ($method === 'GET') {
            $item = get_document('users', $documentId);
            json_response(['exists' => $item !== null, 'item' => $item]);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            $changes = request_json();
            unset($changes['uid'], $changes['email'], $changes['role'], $changes['password_hash']);
            update_user_profile($documentId, $changes);
            json_response(['ok' => true]);
        }
        fail('عملیات مجاز نیست.', 405);
    }

    if ($documentId === '' && $method === 'GET') {
        if (!in_array($collection, $publicRead, true)) {
            require_user();
        }
        $stmt = db()->prepare(
            'SELECT document_id, data FROM app_documents WHERE collection_name = ? ORDER BY created_at DESC'
        );
        $stmt->execute([$collection]);
        $items = [];
        foreach ($stmt->fetchAll() as $row) {
            $data = json_decode((string)$row['data'], true) ?: [];
            if (!$isAdmin && in_array($collection, $private, true)) {
                $ownsMessage = $collection === 'messages'
                    && (($data['senderId'] ?? '') === ($user['uid'] ?? '')
                        || ($data['receiverId'] ?? '') === ($user['uid'] ?? ''));
                if (!$ownsMessage && ($data['userId'] ?? '') !== ($user['uid'] ?? '')) {
                    continue;
                }
            }
            $items[$row['document_id']] = $data;
        }
        $orderBy = (string)($_GET['orderBy'] ?? '');
        if ($orderBy !== '') {
            uasort($items, static fn(array $a, array $b): int =>
                strcmp((string)($a[$orderBy] ?? ''), (string)($b[$orderBy] ?? ''))
            );
        }
        json_response(['items' => $items]);
    }

    if ($documentId === '' && $method === 'POST') {
        $actor = require_user();
        if (!$isAdmin && !in_array($collection, $studentCreate, true)) {
            fail('این عملیات فقط برای مدیر مجاز است.', 403);
        }
        $data = request_json();
        if (!$isAdmin) {
            $data['userId'] = $actor['uid'];
        }
        $id = make_id($collection);
        save_document($collection, $id, $data);
        json_response(['id' => $id]);
    }

    if ($documentId === '') {
        fail('شناسه لازم است.', 400);
    }

    $existing = get_document($collection, $documentId);

    if ($method === 'GET') {
        if (!in_array($collection, $publicRead, true)) {
            $actor = require_user();
            $ownsMessage = $collection === 'messages' && $existing
                && (($existing['senderId'] ?? '') === $actor['uid']
                    || ($existing['receiverId'] ?? '') === $actor['uid']);
            if (!$isAdmin && !$ownsMessage && (($existing['userId'] ?? '') !== $actor['uid'])) {
                fail('دسترسی مجاز نیست.', 403);
            }
        }
        json_response(['exists' => $existing !== null, 'item' => $existing]);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $actor = require_user();
        $changes = request_json();
        if (!$isAdmin) {
            $dateCollections = ['toefl_dates', 'mock_dates', 'gre_dates'];
            if (in_array($collection, $dateCollections, true) && $existing && array_key_exists('registered', $changes)) {
                $changes = ['registered' => ((int)($existing['registered'] ?? 0)) + 1];
            } elseif ($collection === 'registration_assignments' && $existing && ($existing['userId'] ?? '') === $actor['uid']) {
                $changes = array_intersect_key($changes, array_flip(['status', 'viewedAt', 'registeredAt']));
            } else {
                fail('این عملیات فقط برای مدیر مجاز است.', 403);
            }
        }
        $data = $existing ?? [];
        if ($method === 'PUT') {
            $data = array_merge($data, $changes);
        } else {
            dotted_update($data, $changes);
        }
        save_document($collection, $documentId, $data);
        json_response(['ok' => true]);
    }

    if ($method === 'DELETE') {
        require_admin();
        $stmt = db()->prepare(
            'DELETE FROM app_documents WHERE collection_name = ? AND document_id = ?'
        );
        $stmt->execute([$collection, $documentId]);
        json_response(['ok' => true]);
    }

    fail('عملیات مجاز نیست.', 405);
} catch (PDOException $error) {
    error_log($error->getMessage());
    fail('ارتباط با پایگاه داده برقرار نشد. تنظیمات config.php را بررسی کنید.', 500);
} catch (Throwable $error) {
    error_log($error->getMessage());
    fail($error->getMessage() ?: 'خطای داخلی سرور.', 500);
}
