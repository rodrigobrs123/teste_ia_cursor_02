<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'nuvempago' => [
        'client_id' => env('NUVEMPAGO_CLIENT_ID'),
        'client_secret' => env('NUVEMPAGO_CLIENT_SECRET'),
        'sandbox' => env('NUVEMPAGO_SANDBOX', true),
    ],

    'mercadopago' => [
        // Default to provided test keys if env not set
        'public_key' => env('MERCADOPAGO_PUBLIC_KEY', 'APP_USR-2cae30fc-494d-40dd-815d-1c2a5f7bc250'),
        'access_token' => env('MERCADOPAGO_ACCESS_TOKEN', 'APP_USR-6504293319698934-102211-5d652799fa97a98bf607a8d5ab5c6813-2935832258'),
        'sandbox' => env('MERCADOPAGO_SANDBOX', true),
    ],

];
