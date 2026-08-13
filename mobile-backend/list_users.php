<?php
$users = App\Models\User::all(['id', 'name', 'email', 'role'])->toArray();
echo json_encode($users, JSON_PRETTY_PRINT);
