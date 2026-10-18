<?php
$work_id = (int) ($args["id"] ?? get_the_ID());
$work = portfolio_find_work_data($work_id);
if (!$work) {
  return;
}
$private = $work["visibility"] === "private";
$archive_url = $private ? home_url("/private-works/") : get_post_type_archive_link("works");
?>
<article class="p-portfolio-detail p-portfolio-detail--work">
  <div class="l-portfolio-inner">
    <nav class="p-portfolio-detail__breadcrumb" aria-label="パンくず"><a href="<?php echo esc_url(home_url("/")); ?>">Home</a><span aria-hidden="true">/</span><a href="<?php echo esc_url($archive_url); ?>"><?php echo $private
  ? "Private Works"
  : "Works"; ?></a></nav>
    <h1 id="portfolio-work-title" class="p-portfolio-detail__title"><?php echo esc_html($work["title"]); ?></h1>
    <?php get_template_part("template-parts/portfolio-light-cue"); ?>
    <?php if ($work["subtitle"]): ?><p class="p-portfolio-detail__subtitle"><?php echo esc_html($work["subtitle"]); ?></p><?php endif; ?>
    <?php if ($work["graduation"]): ?><p class="p-portfolio-detail__origin">School Graduation Project / スクール卒業制作</p><?php endif; ?>
    <dl class="p-portfolio-detail__meta">
      <dt>案件区分</dt><dd><?php echo esc_html($work["project_type"]); ?></dd>
      <dt>担当範囲</dt><dd><?php echo esc_html($work["role"]); ?></dd>
      <dt>使用技術</dt><dd><?php echo esc_html(implode(" / ", $work["technologies"])); ?></dd>
      <?php if ($work["period"]): ?><dt><?php echo esc_html($work["period_label"]); ?></dt><dd><?php echo esc_html($work["period"]); ?></dd><?php endif; ?>
      <?php if ($work["status"]): ?><dt>制作・対応状況</dt><dd><?php echo esc_html($work["status"]); ?></dd><?php endif; ?>
      <?php if ($work["url"]): ?><dt>Website</dt><dd><a href="<?php echo esc_url($work["url"]); ?>" target="_blank" rel="noopener noreferrer">Visit Website <span aria-hidden="true">↗</span></a></dd><?php endif; ?>
    </dl>
    <?php if (!$private && !empty($work["demo_access_note"])): ?><p class="p-portfolio-detail__origin"><?php echo nl2br(esc_html($work["demo_access_note"])); ?></p><?php endif; ?>
    <div id="portfolio-work-image-<?php echo esc_attr($work_id); ?>" class="p-portfolio-detail__image js-work-reveal" data-portfolio-transition-image data-portfolio-work-url="<?php echo esc_url(
  $work["permalink"],
); ?>"><?php echo portfolio_build_work_image($work_id, "full", [
  "loading" => "eager",
  "sizes" => "(min-width: 1440px) 1280px, (min-width: 1024px) calc(100vw - 160px), (min-width: 768px) calc(100vw - 96px), calc(100vw - 40px)",
]); ?></div>
    <?php if ($work["image_kind"] === "illustration"): ?><p class="p-portfolio-detail__image-caption">画像は案件内容を表すAI生成のイメージです。実際の制作画面・製品写真ではありません。</p><?php elseif (
      $work["demo_image"]
    ): ?><p class="p-portfolio-detail__image-caption">画像はデザイン確認用の仮画像です。実際の制作画面へ差し替え予定です。</p><?php endif; ?>
    <div class="p-portfolio-detail__body">
      <?php if ($work["overview"]): ?><section><h2>プロジェクト概要</h2><?php echo wp_kses_post(wpautop($work["overview"])); ?></section><?php endif; ?>
      <?php if ($work["tasks"]): ?><section><h2>担当業務</h2><ul><?php foreach ($work["tasks"] as $task): ?><li><?php echo esc_html($task); ?></li><?php endforeach; ?></ul></section><?php endif; ?>
      <?php if ($work["implementation"]): ?><section><h2><?php echo esc_html($work["implementation_title"]); ?></h2><?php echo wp_kses_post(wpautop($work["implementation"])); ?></section><?php endif; ?>
      <?php if ($work["award"]): ?><section><h2>受賞実績</h2><p><?php echo esc_html($work["award"]); ?></p></section><?php endif; ?>
    </div>
    <div class="p-portfolio-detail__navigation"><a href="<?php echo esc_url($archive_url); ?>">← <?php echo $private ? "非公開実績" : "制作実績一覧"; ?>へ戻る</a><a href="<?php echo esc_url(
  home_url("/#contact"),
); ?>">Contact <span aria-hidden="true">↗</span></a></div>
  </div>
</article>
