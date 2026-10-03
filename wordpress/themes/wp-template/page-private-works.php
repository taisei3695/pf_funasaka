<?php
/* Template Name: Private Works */
if (!portfolio_private_is_authenticated()) {
  status_header(404);
  include get_404_template();
  return;
}
get_header();
?>
<main id="main" class="l-main">
  <section class="p-portfolio-section p-portfolio-works">
    <div class="l-portfolio-inner">
      <h1 class="p-portfolio-section__title">PRIVATE WORKS</h1>
      <div class="p-portfolio-works__list">
      <?php
      $private_works = portfolio_private_works(100);
      if (!$private_works): ?><p>掲載許可のある非公開実績は準備中です。</p><?php endif;
      foreach ($private_works as $work_post) {
        get_template_part("template-parts/portfolio-work-card", null, ["id" => $work_post->ID]);
      }
      ?>
      </div>
    </div>
  </section>
</main>
<?php get_footer(); ?>
