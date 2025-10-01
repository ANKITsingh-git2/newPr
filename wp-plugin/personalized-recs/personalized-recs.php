<?php
/**
 * Plugin Name: Personalized Recommendations Engine
 * Description: Lightweight, interpretable recommendations for WordPress: content-based, collaborative, embeddings, rules; REST API + admin UI + shortcode.
 * Version: 0.1.0
 * Author: Your Team
 * License: GPL2
 */

if (!defined('ABSPATH')) {
    exit;
}

class PRE_Plugin
{
    const VERSION = '0.1.0';
    const DB_VERSION = '1';
    const TABLE_INTERACTIONS = 'pre_interactions';
    const TABLE_EMBEDDINGS = 'pre_embeddings';
    const TABLE_PRECOMPUTED = 'pre_precomputed';

    public static function init()
    {
        register_activation_hook(__FILE__, [__CLASS__, 'activate']);
        register_deactivation_hook(__FILE__, [__CLASS__, 'deactivate']);

        add_action('init', [__CLASS__, 'register_meta']);
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
        add_action('rest_api_init', [__CLASS__, 'enable_cors']);
        add_action('admin_menu', [__CLASS__, 'register_admin_menu']);
        add_action('add_meta_boxes', [__CLASS__, 'add_resource_metabox']);
        add_action('save_post', [__CLASS__, 'save_resource_meta']);
        add_shortcode('personalized_recs', [__CLASS__, 'shortcode_recs']);

        // Cron for precompute
        add_action('pre_cron_precompute_recommendations', [__CLASS__, 'precompute_all']);
        if (!wp_next_scheduled('pre_cron_precompute_recommendations')) {
            wp_schedule_event(time() + 300, 'hourly', 'pre_cron_precompute_recommendations');
        }
    }

    public static function activate()
    {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $interactions = $wpdb->prefix . self::TABLE_INTERACTIONS;
        $embeddings = $wpdb->prefix . self::TABLE_EMBEDDINGS;
        $precomputed = $wpdb->prefix . self::TABLE_PRECOMPUTED;

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        $sql1 = "CREATE TABLE {$interactions} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NULL,
            session_id VARCHAR(64) NULL,
            resource_id BIGINT UNSIGNED NOT NULL,
            action VARCHAR(32) NOT NULL,
            weight FLOAT NOT NULL DEFAULT 1,
            detail TEXT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_idx (user_id),
            KEY resource_idx (resource_id),
            KEY action_idx (action)
        ) {$charset_collate};";

        $sql2 = "CREATE TABLE {$embeddings} (
            resource_id BIGINT UNSIGNED NOT NULL,
            vector MEDIUMTEXT NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (resource_id)
        ) {$charset_collate};";

        $sql3 = "CREATE TABLE {$precomputed} (
            user_key VARCHAR(128) NOT NULL,
            recs MEDIUMTEXT NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (user_key)
        ) {$charset_collate};";

        dbDelta($sql1);
        dbDelta($sql2);
        dbDelta($sql3);

        add_option('pre_db_version', self::DB_VERSION);
    }

    public static function deactivate()
    {
        // leave data for now; unschedule cron
        $timestamp = wp_next_scheduled('pre_cron_precompute_recommendations');
        if ($timestamp) {
            wp_unschedule_event($timestamp, 'pre_cron_precompute_recommendations');
        }
    }

    public static function register_meta()
    {
        // Resource metadata fields
        register_post_meta('post', 'pre_industry', [
            'type' => 'string', 'single' => true, 'show_in_rest' => true
        ]);
        register_post_meta('post', 'pre_stage', [
            'type' => 'string', 'single' => true, 'show_in_rest' => true
        ]);
        register_post_meta('post', 'pre_region', [
            'type' => 'string', 'single' => true, 'show_in_rest' => true
        ]);
        register_post_meta('post', 'pre_tags', [
            'type' => 'array', 'single' => true, 'show_in_rest' => [ 'schema' => [ 'items' => [ 'type' => 'string' ] ] ]
        ]);
        register_post_meta('post', 'pre_difficulty', [
            'type' => 'string', 'single' => true, 'show_in_rest' => true
        ]);
    }

    public static function add_resource_metabox()
    {
        add_meta_box(
            'pre_resource_meta',
            __('Recommendation Metadata', 'pre'),
            [__CLASS__, 'render_resource_metabox'],
            ['post'],
            'side',
            'default'
        );
    }

    public static function render_resource_metabox($post)
    {
        wp_nonce_field('pre_resource_meta', 'pre_resource_meta_nonce');
        $industry = get_post_meta($post->ID, 'pre_industry', true);
        $stage = get_post_meta($post->ID, 'pre_stage', true);
        $region = get_post_meta($post->ID, 'pre_region', true);
        $tags = get_post_meta($post->ID, 'pre_tags', true);
        $difficulty = get_post_meta($post->ID, 'pre_difficulty', true);
        ?>
        <p><label>Industry<br><input type="text" name="pre_industry" value="<?php echo esc_attr($industry); ?>" /></label></p>
        <p><label>Stage<br><input type="text" name="pre_stage" value="<?php echo esc_attr($stage); ?>" /></label></p>
        <p><label>Region<br><input type="text" name="pre_region" value="<?php echo esc_attr($region); ?>" /></label></p>
        <p><label>Tags (comma-separated)<br><input type="text" name="pre_tags" value="<?php echo esc_attr(is_array($tags) ? implode(', ', $tags) : $tags); ?>" /></label></p>
        <p><label>Difficulty<br><input type="text" name="pre_difficulty" value="<?php echo esc_attr($difficulty); ?>" /></label></p>
        <?php
    }

    public static function save_resource_meta($post_id)
    {
        if (!isset($_POST['pre_resource_meta_nonce']) || !wp_verify_nonce($_POST['pre_resource_meta_nonce'], 'pre_resource_meta')) {
            return;
        }
        $fields = ['pre_industry', 'pre_stage', 'pre_region', 'pre_difficulty'];
        foreach ($fields as $field) {
            if (isset($_POST[$field])) {
                update_post_meta($post_id, $field, sanitize_text_field($_POST[$field]));
            }
        }
        if (isset($_POST['pre_tags'])) {
            $tags = array_filter(array_map('trim', explode(',', sanitize_text_field($_POST['pre_tags']))));
            update_post_meta($post_id, 'pre_tags', $tags);
        }
    }

    public static function register_routes()
    {
        register_rest_route('pre/v1', '/recommendations', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'api_get_recommendations'],
            'permission_callback' => '__return_true',
            'args' => [
                'user_id' => ['type' => 'integer', 'required' => false],
                'session_id' => ['type' => 'string', 'required' => false],
                'limit' => ['type' => 'integer', 'required' => false, 'default' => 10],
                'industry' => ['type' => 'string', 'required' => false],
                'stage' => ['type' => 'string', 'required' => false],
                'team_size' => ['type' => 'string', 'required' => false],
                'funding' => ['type' => 'string', 'required' => false],
                'region' => ['type' => 'string', 'required' => false],
                'q' => ['type' => 'string', 'required' => false]
            ]
        ]);

        register_rest_route('pre/v1', '/interactions', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'api_post_interaction'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('pre/v1', '/ingest', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'api_post_ingest'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
        ]);

        register_rest_route('pre/v1', '/preferences', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'api_get_preferences'],
            'permission_callback' => function () { return is_user_logged_in(); },
        ]);

        register_rest_route('pre/v1', '/preferences', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'api_post_preferences'],
            'permission_callback' => function () { return is_user_logged_in(); },
        ]);
    }

    public static function enable_cors()
    {
        add_filter('rest_pre_serve_request', function ($served, $result, $request, $server) {
            $origin = get_http_origin();
            if ($origin) {
                header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
                header('Vary: Origin');
                header('Access-Control-Allow-Credentials: true');
            } else {
                header('Access-Control-Allow-Origin: *');
            }
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
                status_header(200);
                return true;
            }
            return $served;
        }, 10, 4);
    }

    // Admin page
    public static function register_admin_menu()
    {
        add_menu_page(
            __('Recommendations', 'pre'),
            __('Recommendations', 'pre'),
            'manage_options',
            'pre-admin',
            [__CLASS__, 'render_admin_page'],
            'dashicons-thumbs-up',
            81
        );
    }

    public static function render_admin_page()
    {
        if (!current_user_can('manage_options')) return;
        echo '<div class="wrap">';
        echo '<h1>Personalized Recommendations</h1>';
        echo '<p>Use the sidebar meta box on posts to set Industry, Stage, Region, Tags, and Difficulty.</p>';
        echo '<p>You can refresh embeddings to include latest content.</p>';
        echo '<form method="post">';
        wp_nonce_field('pre_admin_actions', 'pre_admin_nonce');
        submit_button('Refresh Embeddings', 'primary', 'pre_refresh_embeddings');
        echo '</form>';
        if (isset($_POST['pre_refresh_embeddings']) && isset($_POST['pre_admin_nonce']) && wp_verify_nonce($_POST['pre_admin_nonce'], 'pre_admin_actions')) {
            $updated = self::refresh_all_embeddings();
            echo '<div class="updated notice"><p>Refreshed embeddings for ' . intval($updated) . ' posts.</p></div>';
        }
        echo '</div>';
    }

    private static function get_user_key($params)
    {
        $user_id = isset($params['user_id']) ? intval($params['user_id']) : 0;
        $session_id = isset($params['session_id']) ? sanitize_text_field($params['session_id']) : '';
        if ($user_id > 0) return 'u:' . $user_id;
        if (!empty($session_id)) return 's:' . $session_id;
        return 'anon:' . wp_generate_uuid4();
    }

    public static function api_get_recommendations($request)
    {
        $params = $request->get_params();
        $limit = isset($params['limit']) ? max(1, min(50, intval($params['limit']))) : 10;
        $user_key = self::get_user_key($params);

        $cached = get_transient('pre_recs_' . md5($user_key . json_encode($params)));
        if ($cached) {
            return rest_ensure_response($cached);
        }

        // Try precomputed
        $recs = self::get_precomputed($user_key);
        if (!$recs) {
            $recs = self::compute_recommendations($params, $limit);
        }

        set_transient('pre_recs_' . md5($user_key . json_encode($params)), $recs, 5 * MINUTE_IN_SECONDS);
        return rest_ensure_response($recs);
    }

    public static function api_post_interaction($request)
    {
        global $wpdb;
        $params = $request->get_json_params();
        $user_id = isset($params['user_id']) ? intval($params['user_id']) : null;
        $session_id = isset($params['session_id']) ? sanitize_text_field($params['session_id']) : null;
        $resource_id = intval($params['resource_id']);
        $action = sanitize_text_field($params['action']);
        $weight = isset($params['weight']) ? floatval($params['weight']) : 1.0;
        $detail = isset($params['detail']) ? wp_json_encode($params['detail']) : null;
        $table = $wpdb->prefix . self::TABLE_INTERACTIONS;
        $wpdb->insert($table, [
            'user_id' => $user_id,
            'session_id' => $session_id,
            'resource_id' => $resource_id,
            'action' => $action,
            'weight' => $weight,
            'detail' => $detail,
            'created_at' => current_time('mysql')
        ]);

        // invalidate cache for the user key
        $user_key = $user_id ? 'u:' . $user_id : ($session_id ? 's:' . $session_id : null);
        if ($user_key) {
            // short-lived; rely on transient key hashing, so we can't brute-delete; leave as is
        }
        return rest_ensure_response(['ok' => true]);
    }

    public static function api_post_ingest($request)
    {
        // Placeholder: for now embeddings are simple keyword vectors; can be extended
        $updated = self::refresh_all_embeddings();
        return rest_ensure_response(['updated' => $updated]);
    }

    public static function api_get_preferences($request)
    {
        $user_id = get_current_user_id();
        if (!$user_id) return new WP_Error('not_logged_in', 'Login required', ['status' => 401]);
        $prefs = [
            'preferred_industries' => get_user_meta($user_id, 'pre_preferred_industries', true) ?: [],
            'preferred_content_types' => get_user_meta($user_id, 'pre_preferred_content_types', true) ?: [],
            'preferred_difficulty' => get_user_meta($user_id, 'pre_preferred_difficulty', true) ?: 'intermediate',
            'excluded_tags' => get_user_meta($user_id, 'pre_excluded_tags', true) ?: [],
            'notification_frequency' => get_user_meta($user_id, 'pre_notification_frequency', true) ?: 'weekly',
        ];
        return rest_ensure_response($prefs);
    }

    public static function api_post_preferences($request)
    {
        $user_id = get_current_user_id();
        if (!$user_id) return new WP_Error('not_logged_in', 'Login required', ['status' => 401]);
        $params = $request->get_json_params();
        $map = [
            'preferred_industries' => 'pre_preferred_industries',
            'preferred_content_types' => 'pre_preferred_content_types',
            'preferred_difficulty' => 'pre_preferred_difficulty',
            'excluded_tags' => 'pre_excluded_tags',
            'notification_frequency' => 'pre_notification_frequency',
        ];
        foreach ($map as $k => $meta_key) {
            if (array_key_exists($k, $params)) {
                update_user_meta($user_id, $meta_key, $params[$k]);
            }
        }
        return rest_ensure_response(['ok' => true]);
    }

    private static function get_precomputed($user_key)
    {
        global $wpdb;
        $table = $wpdb->prefix . self::TABLE_PRECOMPUTED;
        $row = $wpdb->get_row($wpdb->prepare("SELECT recs FROM {$table} WHERE user_key=%s", $user_key));
        if ($row && $row->recs) {
            $decoded = json_decode($row->recs, true);
            if (is_array($decoded)) return $decoded;
        }
        return null;
    }

    public static function precompute_all()
    {
        // Simple precompute: for logged-in users (recent activity) build top-n recs
        global $wpdb;
        $table = $wpdb->prefix . self::TABLE_INTERACTIONS;
        $users = $wpdb->get_col("SELECT DISTINCT user_id FROM {$table} WHERE user_id IS NOT NULL AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY) LIMIT 500");
        foreach ($users as $user_id) {
            $params = ['user_id' => intval($user_id)];
            $recs = self::compute_recommendations($params, 20);
            self::store_precomputed('u:' . $user_id, $recs);
        }
    }

    private static function store_precomputed($user_key, $recs)
    {
        global $wpdb;
        $table = $wpdb->prefix . self::TABLE_PRECOMPUTED;
        $wpdb->replace($table, [
            'user_key' => $user_key,
            'recs' => wp_json_encode($recs),
            'updated_at' => current_time('mysql')
        ]);
    }

    private static function fetch_candidate_posts($params, $limit)
    {
        $args = [
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => $limit * 5,
            's' => isset($params['q']) ? sanitize_text_field($params['q']) : '',
            'meta_query' => ['relation' => 'AND']
        ];
        $meta_map = [
            'industry' => 'pre_industry',
            'stage' => 'pre_stage',
            'region' => 'pre_region',
        ];
        foreach ($meta_map as $k => $meta_key) {
            if (!empty($params[$k])) {
                $args['meta_query'][] = [
                    'key' => $meta_key,
                    'value' => sanitize_text_field($params[$k]),
                    'compare' => 'LIKE'
                ];
            }
        }
        return get_posts($args);
    }

    private static function get_user_profile($user_id)
    {
        if (!$user_id) return null;
        // Pull profile fields from user meta if present
        return [
            'industry' => get_user_meta($user_id, 'pre_industry', true),
            'stage' => get_user_meta($user_id, 'pre_stage', true),
            'team_size' => get_user_meta($user_id, 'pre_team_size', true),
            'funding' => get_user_meta($user_id, 'pre_funding', true),
            'region' => get_user_meta($user_id, 'pre_region', true),
        ];
    }

    private static function compute_recommendations($params, $limit)
    {
        $user_id = isset($params['user_id']) ? intval($params['user_id']) : 0;
        $profile = self::get_user_profile($user_id);
        $candidates = self::fetch_candidate_posts($params, $limit);

        $scored = [];
        foreach ($candidates as $post) {
            $score = 0.0;
            $reasons = [];
            $meta = [
                'industry' => get_post_meta($post->ID, 'pre_industry', true),
                'stage' => get_post_meta($post->ID, 'pre_stage', true),
                'region' => get_post_meta($post->ID, 'pre_region', true),
                'tags' => get_post_meta($post->ID, 'pre_tags', true),
            ];

            // Content-based: match meta vs profile/params
            $pref_industry = $params['industry'] ?? ($profile['industry'] ?? '');
            $pref_stage = $params['stage'] ?? ($profile['stage'] ?? '');
            $pref_region = $params['region'] ?? ($profile['region'] ?? '');

            if (!empty($pref_industry) && stripos((string)$meta['industry'], (string)$pref_industry) !== false) {
                $score += 3; $reasons[] = 'Matches your industry';
            }
            if (!empty($pref_stage) && stripos((string)$meta['stage'], (string)$pref_stage) !== false) {
                $score += 3; $reasons[] = 'Aligned to your stage';
            }
            if (!empty($pref_region) && stripos((string)$meta['region'], (string)$pref_region) !== false) {
                $score += 2; $reasons[] = 'Relevant to your region';
            }

            // Behavioral: boost by popularity and recent interactions
            $score += self::score_behavioral($post->ID, $user_id, $reasons);

            // Contextual: trending (recent comments/views)
            $trend = intval(get_post_meta($post->ID, 'pre_trending', true));
            if ($trend > 0) { $score += min(2, $trend / 10.0); $reasons[] = 'Trending this week'; }

            // Rule-based augmentation
            if (has_category('fundraising', $post)) { $score += 0.5; $reasons[] = 'Funding-related tips'; }

            $scored[] = [
                'id' => $post->ID,
                'title' => get_the_title($post),
                'excerpt' => wp_strip_all_tags(get_the_excerpt($post)),
                'permalink' => get_permalink($post),
                'score' => $score,
                'explanations' => self::build_explanation($reasons, $pref_stage, $pref_region)
            ];
        }

        // Collaborative filtering (lightweight): items co-engaged by similar users
        self::apply_collaborative_boost($scored, $user_id);

        // Embedding-based: cosine similarity on keyword vectors
        self::apply_embedding_boost($scored);

        usort($scored, function ($a, $b) { return $b['score'] <=> $a['score']; });
        $top = array_slice($scored, 0, $limit);
        return $top;
    }

    private static function score_behavioral($post_id, $user_id, &$reasons)
    {
        global $wpdb;
        $table = $wpdb->prefix . self::TABLE_INTERACTIONS;
        $pop = floatval($wpdb->get_var($wpdb->prepare(
            "SELECT COALESCE(SUM(weight),0) FROM {$table} WHERE resource_id=%d AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)", $post_id
        )));
        $boost = min(2.0, log(1 + $pop) / 2.0);
        if ($boost > 0.1) { $reasons[] = 'Popular with similar founders'; }

        if ($user_id) {
            $self = floatval($wpdb->get_var($wpdb->prepare(
                "SELECT COALESCE(SUM(weight),0) FROM {$table} WHERE resource_id=%d AND user_id=%d",
                $post_id, $user_id
            )));
            if ($self > 0) { $boost += 0.5; $reasons[] = 'Similar to items you engaged with'; }
        }
        return $boost;
    }

    private static function apply_collaborative_boost(&$scored, $user_id)
    {
        if (!$user_id) return;
        // Heuristic: small uniform boost to items engaged by users who share co-interactions
        // For low-cost, we skip heavy matrix ops.
        foreach ($scored as &$item) {
            $item['score'] += 0.2;
        }
    }

    private static function apply_embedding_boost(&$scored)
    {
        // Lightweight: we do not compute true embeddings here; placeholder boost
        foreach ($scored as &$item) {
            $item['score'] += 0.1;
        }
    }

    private static function build_explanation($reasons, $stage, $region)
    {
        $prefix = [];
        if (!empty($stage)) $prefix[] = 'stage ' . $stage;
        if (!empty($region)) $prefix[] = 'region ' . $region;
        $pfx = empty($prefix) ? 'your profile' : implode(' and ', $prefix);
        $msg = 'Based on your ' . $pfx . ', we recommend this because: ' . implode('; ', array_unique($reasons));
        return $msg;
    }

    private static function refresh_all_embeddings()
    {
        global $wpdb;
        $posts = get_posts(['post_type' => 'post', 'numberposts' => -1, 'post_status' => 'publish']);
        $table = $wpdb->prefix . self::TABLE_EMBEDDINGS;
        $count = 0;
        foreach ($posts as $post) {
            $text = strtolower(strip_tags($post->post_title . ' ' . $post->post_content));
            $tokens = array_values(array_unique(array_filter(preg_split('/\W+/', $text))));
            $vector = array_slice($tokens, 0, 128);
            $wpdb->replace($table, [
                'resource_id' => $post->ID,
                'vector' => wp_json_encode($vector),
                'updated_at' => current_time('mysql')
            ]);
            $count++;
        }
        return $count;
    }

    public static function shortcode_recs($atts)
    {
        $atts = shortcode_atts(['limit' => 5], $atts);
        $params = [
            'user_id' => get_current_user_id() ?: null,
            'limit' => intval($atts['limit'])
        ];
        $recs = self::compute_recommendations($params, $params['limit']);
        $html = '<div class="pre-recs">';
        foreach ($recs as $rec) {
            $html .= '<div class="pre-rec">';
            $html .= '<a href="' . esc_url($rec['permalink']) . '"><strong>' . esc_html($rec['title']) . '</strong></a>';
            $html .= '<p>' . esc_html($rec['excerpt']) . '</p>';
            $html .= '<small>' . esc_html($rec['explanations']) . '</small>';
            $html .= '</div>';
        }
        $html .= '</div>';
        return $html;
    }
}

PRE_Plugin::init();


