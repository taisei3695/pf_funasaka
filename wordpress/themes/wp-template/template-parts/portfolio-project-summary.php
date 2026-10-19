<?php
$work = $args["project"] ?? [];
if (!$work || empty($work["id"])) {
  return;
}
$work_id = (int) $work["id"];
$heading_tag = ($args["heading_level"] ?? 3) === 4 ? "h4" : "h3";
$image_attributes = wp_parse_args($args["image_attributes"] ?? [], ["loading" => "lazy", "sizes" => "(min-width: 1440px) 614px, (min-width: 1024px) calc(50vw - 98px), (min-width: 768px) calc(50vw - 66px), calc(100vw - 42px)"]);
// Nearby lazy images may still fetch early; keep the visible lead image first.
if ($image_attributes["loading"] === "lazy" && !isset($image_attributes["fetchpriority"])) {
  $image_attributes["fetchpriority"] = "low";
}
?>
<article class="p-portfolio-project">
  <a class="p-portfolio-project__image" href="<?php echo esc_url($work["permalink"]); ?>" aria-label="<?php echo esc_attr($work["title"] . " の詳細を見る"); ?>">
    <?php echo portfolio_build_work_image($work_id, "large", $image_attributes); ?>
    <?php if ($work["image_kind"] === "illustration"): ?><span class="p-portfolio-project__image-note">イメージ画像</span><?php endif; ?>
  </a>
  <div class="p-portfolio-project__content">
    <?php if ($work["category"]): ?><p class="p-portfolio-project__category"><?php echo esc_html($work["category"]); ?></p><?php endif; ?>
    <<?php echo $heading_tag; ?> class="p-portfolio-project__title"><a href="<?php echo esc_url($work["permalink"]); ?>"><?php echo esc_html($work["title"]); ?></a></<?php echo $heading_tag; ?>>
    <?php if ($work["summary"]): ?><p class="p-portfolio-project__summary"><?php echo esc_html($work["summary"]); ?></p><?php endif; ?>
    <dl class="p-portfolio-project__meta">
      <?php if ($work["role"]): ?><div><dt>担当</dt><dd><?php echo esc_html($work["role"]); ?></dd></div><?php endif; ?>
      <?php if ($work["period"]): ?><div><dt><?php echo esc_html($work["period_label"]); ?></dt><dd><?php echo esc_html($work["period"]); ?></dd></div><?php endif; ?>
      <?php if ($work["status"]): ?><div><dt>状況</dt><dd class="p-portfolio-project__status"><?php echo esc_html($work["status"]); ?></dd></div><?php endif; ?>
    </dl>
    <?php if ($work["technologies"]): ?><ul class="p-portfolio-tags" aria-label="使用技術"><?php foreach ($work["technologies"] as $technology): ?><li><?php echo esc_html($technology); ?></li><?php endforeach; ?></ul><?php endif; ?>
    <a class="p-portfolio-project__link" href="<?php echo esc_url($work["permalink"]); ?>" aria-label="<?php echo esc_attr(
  $work["title"] . " の詳細を見る",
); ?>"><span class="p-portfolio-project__link-label">詳細を見る</span> <span aria-hidden="true">→</span></a>
  </div>
</article>
