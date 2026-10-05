<?php
if (!defined("ABSPATH")) {
  exit();
}

// Use WordPress's standard icon output; a later site-icon setting takes priority.
function portfolio_get_site_icon_url($icon_url, $size)
{
  if (!empty($icon_url)) {
    return $icon_url;
  }

  $icon_size = in_array((int) $size, [32, 180, 192], true) ? (int) $size : 512;
  return get_theme_file_uri("/assets/images/icon_favicon-{$icon_size}.png");
}
add_filter("get_site_icon_url", "portfolio_get_site_icon_url", 10, 2);

// SEO Simple Pack owns the meta tags. Keep configured and per-work images.
function portfolio_get_social_image_url($image_url)
{
  if (empty($image_url)) {
    return get_theme_file_uri("/assets/images/ogp_portfolio.jpg");
  }
  return $image_url;
}
add_filter("ssp_output_og_image", "portfolio_get_social_image_url");

function portfolio_get_social_card_type($card_type)
{
  return is_front_page() ? "summary_large_image" : $card_type;
}
add_filter("ssp_output_tw_card", "portfolio_get_social_card_type");
