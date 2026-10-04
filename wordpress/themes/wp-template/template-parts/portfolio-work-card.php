<?php
$work_id = isset($args["id"]) ? (int) $args["id"] : get_the_ID();
$work = portfolio_find_work_data($work_id);
if (!$work) {
  return;
}
$role = $work["role"] ?: implode(" / ", $work["technologies"]);
?>
<article class="p-portfolio-work">
  <a id="portfolio-work-image-<?php echo esc_attr($work_id); ?>" class="p-portfolio-work__image js-work-reveal" data-portfolio-transition-image data-portfolio-work-url="<?php echo esc_url($work["permalink"]); ?>" href="<?php echo esc_url(
  $work["permalink"],
); ?>" aria-label="<?php echo esc_attr($work["title"] . " の詳細を見る"); ?>">
    <?php echo portfolio_build_work_image($work_id, "large", ["sizes" => "(min-width: 1440px) 897.37px, (min-width: 1024px) calc(72.60274vw - 148.10959px), (min-width: 768px) calc(100vw - 96px), calc(100vw - 40px)"]); ?>
  </a>
  <div class="p-portfolio-work__info js-fade-up">
    <h3 class="p-portfolio-work__title"><a href="<?php echo esc_url($work["permalink"]); ?>"><?php echo esc_html($work["title"]); ?></a></h3>
    <p class="p-portfolio-work__type"><?php echo esc_html($work["project_type"]); ?></p>
    <p class="p-portfolio-work__technology"><?php echo esc_html($role); ?></p>
    <a class="p-portfolio-work__link" href="<?php echo esc_url($work["permalink"]); ?>" aria-label="<?php echo esc_attr($work["title"] . " の詳細を見る"); ?>">View Project <span aria-hidden="true">→</span></a>
  </div>
</article>
