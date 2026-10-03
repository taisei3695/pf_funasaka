<?php
$work_id = (int) ($args["id"] ?? get_the_ID());
$work = portfolio_work_data($work_id);
if (!$work) {
  return;
}
$private = $work["visibility"] === "private";
$archive_url = $private ? home_url("/private-works/") : get_post_type_archive_link("works");
?>
<article class="p-portfolio-detail">
  <div class="l-portfolio-inner">
    <nav class="p-portfolio-detail__breadcrumb" aria-label="パンくず"><a href="<?php echo esc_url(home_url("/")); ?>">Home</a><span aria-hidden="true">/</span><a href="<?php echo esc_url($archive_url); ?>"><?php echo $private
  ? "Private Works"
  : "Works"; ?></a></nav>
    <h1 class="p-portfolio-detail__title"><?php echo esc_html($work["title"]); ?></h1>
    <?php if ($work["subtitle"]): ?><p class="p-portfolio-detail__subtitle"><?php echo esc_html($work["subtitle"]); ?></p><?php endif; ?>
    <?php if ($work["graduation"]): ?><p class="p-portfolio-detail__origin">School Graduation Project / スクール卒業制作</p><?php endif; ?>
    <dl class="p-portfolio-detail__meta">
      <dt>Project Type</dt><dd><?php echo esc_html($work["project_type"]); ?></dd>
      <dt>Role</dt><dd><?php echo esc_html($work["role"]); ?></dd>
      <dt>Technology</dt><dd><?php echo esc_html(implode(" / ", $work["technologies"])); ?></dd>
      <?php if ($work["url"]): ?><dt>Website</dt><dd><a href="<?php echo esc_url($work["url"]); ?>" target="_blank" rel="noopener noreferrer">Visit Website <span aria-hidden="true">↗</span></a></dd><?php endif; ?>
    </dl>
    <?php if (!$private && !empty($work["demo_access_note"])): ?><p class="p-portfolio-detail__origin"><?php echo nl2br(esc_html($work["demo_access_note"])); ?></p><?php endif; ?>
    <div class="p-portfolio-detail__image js-work-reveal"><?php echo portfolio_work_image($work_id, "full", ["sizes" => "(min-width: 1440px) 1280px, (min-width: 1024px) calc(100vw - 160px), calc(100vw - 40px)"]); ?></div>
    <?php if ($work["demo_image"]): ?><p class="p-portfolio-detail__origin">画像はデザイン確認用の仮画像です。実際の制作画面へ差し替え予定です。</p><?php endif; ?>
    <div class="p-portfolio-detail__body">
      <?php if ($work["overview"]): ?><section><h2>Overview</h2><?php echo wp_kses_post(wpautop($work["overview"])); ?></section><?php endif; ?>
      <?php if ($work["implementation"]): ?><section><h2>Implementation</h2><?php echo wp_kses_post(wpautop($work["implementation"])); ?></section><?php endif; ?>
    </div>
    <div class="p-portfolio-detail__navigation"><a href="<?php echo esc_url($archive_url); ?>">← Back to <?php echo $private ? "Private Works" : "Works"; ?></a><a href="<?php echo esc_url(
  home_url("/#contact"),
); ?>">Contact <span aria-hidden="true">↗</span></a></div>
  </div>
</article>
