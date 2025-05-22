<?php

/**
 * This file has been auto-generated
 * by the Symfony Routing Component.
 */

return [
    false, // $matchHost
    [ // $staticRoutes
        '/api/test' => [[['_route' => 'api_test', '_controller' => 'App\\Controller\\ApiController::test'], null, ['GET' => 0], null, false, false, null]],
        '/api/protected' => [[['_route' => 'api_protected', '_controller' => 'App\\Controller\\ApiController::protectedAction'], null, ['GET' => 0], null, false, false, null]],
        '/api/exchange/new' => [[['_route' => 'app_exchange_new', '_controller' => 'App\\Controller\\ExchangeController::new'], null, ['POST' => 0], null, false, false, null]],
        '/api/exchange/my' => [[['_route' => 'app_exchange_my', '_controller' => 'App\\Controller\\ExchangeController::getMyExchanges'], null, ['GET' => 0], null, false, false, null]],
        '/api/item' => [[['_route' => 'items', '_controller' => 'App\\Controller\\ItemController::items'], null, ['GET' => 0], null, false, false, null]],
        '/api/item/new' => [[['_route' => 'app_item_new', '_controller' => 'App\\Controller\\ItemController::new'], null, ['POST' => 0], null, false, false, null]],
        '/api/item/related' => [[['_route' => 'related_items', '_controller' => 'App\\Controller\\ItemController::relatedItems'], null, ['GET' => 0], null, false, false, null]],
        '/api/item/my-items' => [[['_route' => 'my_items', '_controller' => 'App\\Controller\\ItemController::myItems'], null, ['GET' => 0], null, false, false, null]],
        '/api/notification/notifications' => [[['_route' => 'app_notification', '_controller' => 'App\\Controller\\NotificationController::getNotifications'], null, ['GET' => 0], null, false, false, null]],
        '/api/register' => [[['_route' => 'app_register', '_controller' => 'App\\Controller\\RegistrationController::register'], null, ['POST' => 0], null, false, false, null]],
        '/api/profile/my-profile' => [
            [['_route' => 'get_my_profile', '_controller' => 'App\\Controller\\UserController::getProfile'], null, ['GET' => 0], null, false, false, null],
            [['_route' => 'update_my_profile', '_controller' => 'App\\Controller\\UserController::updateProfile'], null, ['PUT' => 0], null, false, false, null],
        ],
        '/api/profile/image' => [[['_route' => 'update_profile_image', '_controller' => 'App\\Controller\\UserController::updateProfileImage'], null, ['POST' => 0], null, false, false, null]],
        '/api/login_check' => [[['_route' => 'api_login_check'], null, ['POST' => 0], null, false, false, null]],
    ],
    [ // $regexpList
        0 => '{^(?'
                .'|/api(?'
                    .'|/(?'
                        .'|\\.well\\-known/genid/([^/]++)(*:46)'
                        .'|validation_errors/([^/]++)(*:79)'
                    .')'
                    .'|(?:/(index)(?:\\.([^/]++))?)?(*:115)'
                    .'|/(?'
                        .'|docs(?:\\.([^/]++))?(*:146)'
                        .'|contexts/([^.]+)(?:\\.(jsonld))?(*:185)'
                        .'|e(?'
                            .'|rrors/(\\d+)(?:\\.([^/]++))?(*:223)'
                            .'|xchange/([^/]++)/(?'
                                .'|accept(*:257)'
                                .'|reject(*:271)'
                            .')'
                        .')'
                        .'|validation_errors/([^/]++)(?'
                            .'|(*:310)'
                        .')'
                        .'|i(?'
                            .'|mages/([^/]++)(*:337)'
                            .'|tem/([^/]++)(?'
                                .'|(*:360)'
                            .')'
                        .')'
                    .')'
                .')'
                .'|/uploads/([^/]++)(*:389)'
                .'|/images/([^/]++)(*:413)'
            .')/?$}sDu',
    ],
    [ // $dynamicRoutes
        46 => [[['_route' => 'api_genid', '_controller' => 'api_platform.action.not_exposed', '_api_respond' => 'true'], ['id'], ['GET' => 0, 'HEAD' => 1], null, false, true, null]],
        79 => [[['_route' => 'api_validation_errors', '_controller' => 'api_platform.action.not_exposed'], ['id'], ['GET' => 0, 'HEAD' => 1], null, false, true, null]],
        115 => [[['_route' => 'api_entrypoint', '_controller' => 'api_platform.action.entrypoint', '_format' => '', '_api_respond' => 'true', 'index' => 'index'], ['index', '_format'], ['GET' => 0, 'HEAD' => 1], null, false, true, null]],
        146 => [[['_route' => 'api_doc', '_controller' => 'api_platform.action.documentation', '_format' => '', '_api_respond' => 'true'], ['_format'], ['GET' => 0, 'HEAD' => 1], null, false, true, null]],
        185 => [[['_route' => 'api_jsonld_context', '_controller' => 'api_platform.jsonld.action.context', '_format' => 'jsonld', '_api_respond' => 'true'], ['shortName', '_format'], ['GET' => 0, 'HEAD' => 1], null, false, true, null]],
        223 => [[['_route' => '_api_errors', '_controller' => 'api_platform.symfony.main_controller', '_format' => null, '_stateless' => true, '_api_resource_class' => 'ApiPlatform\\State\\ApiResource\\Error', '_api_operation_name' => '_api_errors'], ['status', '_format'], ['GET' => 0], null, false, true, null]],
        257 => [[['_route' => 'app_exchange_accept', '_controller' => 'App\\Controller\\ExchangeController::acceptExchange'], ['id'], ['POST' => 0], null, false, false, null]],
        271 => [[['_route' => 'app_exchange_reject', '_controller' => 'App\\Controller\\ExchangeController::rejectExchange'], ['id'], ['POST' => 0], null, false, false, null]],
        310 => [
            [['_route' => '_api_validation_errors_problem', '_controller' => 'api_platform.symfony.main_controller', '_format' => null, '_stateless' => true, '_api_resource_class' => 'ApiPlatform\\Validator\\Exception\\ValidationException', '_api_operation_name' => '_api_validation_errors_problem'], ['id'], ['GET' => 0], null, false, true, null],
            [['_route' => '_api_validation_errors_hydra', '_controller' => 'api_platform.symfony.main_controller', '_format' => null, '_stateless' => true, '_api_resource_class' => 'ApiPlatform\\Validator\\Exception\\ValidationException', '_api_operation_name' => '_api_validation_errors_hydra'], ['id'], ['GET' => 0], null, false, true, null],
            [['_route' => '_api_validation_errors_jsonapi', '_controller' => 'api_platform.symfony.main_controller', '_format' => null, '_stateless' => true, '_api_resource_class' => 'ApiPlatform\\Validator\\Exception\\ValidationException', '_api_operation_name' => '_api_validation_errors_jsonapi'], ['id'], ['GET' => 0], null, false, true, null],
        ],
        337 => [[['_route' => 'update_item_images', '_controller' => 'App\\Controller\\ImagesController::updateItemImages'], ['itemId'], ['POST' => 0], null, false, true, null]],
        360 => [
            [['_route' => 'app_item_show', '_controller' => 'App\\Controller\\ItemController::show'], ['id'], ['GET' => 0], null, false, true, null],
            [['_route' => 'app_item_edit', '_controller' => 'App\\Controller\\ItemController::edit'], ['id'], ['POST' => 0], null, false, true, null],
            [['_route' => 'app_item_delete', '_controller' => 'App\\Controller\\ItemController::delete'], ['id'], ['DELETE' => 0], null, false, true, null],
        ],
        389 => [[['_route' => 'serve_upload', '_controller' => 'App\\Controller\\ImagesController::serveUpload'], ['filename'], ['GET' => 0], null, false, true, null]],
        413 => [
            [['_route' => 'serve_image', '_controller' => 'App\\Controller\\ImagesController::serveImage'], ['filename'], ['GET' => 0], null, false, true, null],
            [null, null, null, null, false, false, 0],
        ],
    ],
    null, // $checkCondition
];
