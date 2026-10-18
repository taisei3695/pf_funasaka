<?php
$variant = $args["variant"] ?? "detail";
if (!in_array($variant, ["list", "detail", "privacy"], true)) {
  $variant = "detail";
}
?>
<div class="c-portfolio-backdrop c-portfolio-backdrop--<?php echo esc_attr($variant); ?> js-portfolio-backdrop" data-backdrop-variant="<?php echo esc_attr($variant); ?>" aria-hidden="true">
  <span class="c-portfolio-backdrop__glow"></span>
  <?php if ($variant === "detail"): ?><span class="c-portfolio-backdrop__glow c-portfolio-backdrop__glow--opposite"></span><?php endif; ?>
  <?php if ($variant === "list"): ?>
    <div class="c-portfolio-backdrop__particles">
      <?php for ($particle = 0; $particle < 12; $particle++): ?><span class="c-portfolio-backdrop__particle"></span><?php endfor; ?>
    </div>
  <?php endif; ?>
</div>
