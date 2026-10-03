<?php
if (!defined("ABSPATH")) {
  exit();
}
/** Fixed sections need no extra ACF fields. Supply the actual address in wp-config.php. */
function portfolio_get_contact_email()
{
  // TODO: Set portfolio contact email address
  $email = defined("PORTFOLIO_CONTACT_EMAIL") ? PORTFOLIO_CONTACT_EMAIL : get_option("portfolio_contact_email", "");
  return is_email($email) ? sanitize_email($email) : "";
}
add_filter("wpcf7_load_js", "__return_false");
add_filter("wpcf7_load_css", "__return_false");
function portfolio_build_section_url($section)
{
  return is_front_page() ? "#" . $section : home_url("/#" . $section);
}
