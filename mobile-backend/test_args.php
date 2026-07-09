<?php
function handle($role1, ...$roles) {
    var_dump($role1);
    var_dump($roles);
}
handle('Mekanik', 'Admin');
