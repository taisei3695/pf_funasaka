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

/** Build public theme-image markup from the dimensions of files that exist. */
function portfolio_build_theme_image($filename, $attr = [])
{
  if (!preg_match("/^[a-z0-9][a-z0-9_-]*[.]webp$/", $filename)) {
    return "";
  }
  $path = get_theme_file_path("/assets/images/" . $filename);
  $dimensions = is_file($path) ? wp_getimagesize($path) : false;
  if (!$dimensions) {
    return "";
  }
  $src = get_theme_file_uri("/assets/images/" . $filename);
  $sources = [$src . " " . (int) $dimensions[0] . "w"];
  $retina_filename = preg_replace("/[.]webp$/", "-2x.webp", $filename);
  $retina_path = get_theme_file_path("/assets/images/" . $retina_filename);
  $retina_dimensions = is_file($retina_path) ? wp_getimagesize($retina_path) : false;
  if ($retina_dimensions && $retina_dimensions[0] > $dimensions[0]) {
    $sources[] = get_theme_file_uri("/assets/images/" . $retina_filename) . " " . (int) $retina_dimensions[0] . "w";
  }
  $attributes = array_merge(wp_parse_args($attr, ["loading" => "lazy", "decoding" => "async", "alt" => "", "sizes" => "100vw"]), [
    "src" => $src,
    "srcset" => implode(", ", $sources),
    "width" => (int) $dimensions[0],
    "height" => (int) $dimensions[1],
  ]);
  $html = "<img";
  foreach ($attributes as $name => $value) {
    if (preg_match("/^(?:src|srcset|alt|width|height|loading|decoding|class|sizes|fetchpriority)$/", $name)) {
      $html .= " " . $name . '="' . esc_attr($value) . '"';
    }
  }
  return $html . " />";
}
