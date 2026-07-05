<?php
declare(strict_types=1);

return [
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'YOUR_DATABASE_NAME',
        'user' => 'YOUR_DATABASE_USER',
        'pass' => 'YOUR_DATABASE_PASSWORD',
        'charset' => 'utf8mb4',
    ],
    'admin' => [
        'email' => 'admin@allameh-sokhan.ir',
        'password' => 'CHANGE_THIS_PASSWORD',
        'name' => 'مدیر آموزشگاه',
    ],
    'session' => [
        'name' => 'allameh_session',
        'secure' => true,
    ],
];
