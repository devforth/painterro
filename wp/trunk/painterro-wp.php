<?php

/*
Plugin Name: Painterro
Plugin URI: https://github.com/ivictbor/painterro
Description: Paste screenshots and edit images directly in browser. Adds Painterro button to visual editor for images editing. Absolutely free and open source.
Version: 0.2.77
Author: Ivan Borshchov
License: MIT
*/

define("PAINTERRO_FILE", "painterro-0.2.77.min.js");

function include_painterro_script()
{
	// For unminified version please see https://github.com/ivictbor/painterro, source map file included in plugin dir (.map)
    wp_register_script('painterro-script', plugin_dir_url(__FILE__) . PAINTERRO_FILE);
	wp_enqueue_script('painterro-script');
}

// add_action('wp_enqueue_scripts', 'include_painterro_script'); //uncomment to include in whole site
add_action('admin_enqueue_scripts', 'include_painterro_script');

function painterro_add_stylesheet() {
    wp_register_style('painterro_style', plugins_url('style.css', __FILE__) );
    wp_enqueue_style('painterro_style');
}
// add_action( 'wp_enqueue_scripts', 'painterro_add_stylesheet' ); //uncomment to include in whole site
add_action( 'admin_enqueue_scripts', 'painterro_add_stylesheet' );

function enqueue_painterro_plugin_scripts($plugin_array)
{
	//enqueue TinyMCE plugin script with its ID.
    $plugin_array["painterro_plugin"] =  plugin_dir_url(__FILE__) . "index.js";
    return $plugin_array;
}

add_filter("mce_external_plugins", "enqueue_painterro_plugin_scripts");

function register_painterro_buttons_editor($buttons)
{
    //register buttons with their id.
    array_push($buttons, "painterro");
    return $buttons;
}

add_filter("mce_buttons", "register_painterro_buttons_editor");

function painterro_admin_head() {
	global $post;
    echo '<script type="text/javascript"> var ptro_post_id =' . $post->ID . 
		'; var ptro_media_send_to_editor_nonce = "' . wp_create_nonce( 'media-send-to-editor' ) .
		'"; var ptro_media_form_nonce = "' . wp_create_nonce( 'media-form' ) . '" </script>';
}
add_action( 'admin_head', 'painterro_admin_head' );
