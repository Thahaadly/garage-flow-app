<?php
$ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyD39K2eh32y8jps-HBOnBhI1tE75-G9REk');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
echo curl_exec($ch);
