<?php get_header(); ?>
<main id="main" class="l-main">
  <div class="p-portfolio-intro js-portfolio-intro">
    <div class="p-portfolio-intro__stage" aria-hidden="true">
      <canvas class="p-portfolio-intro__canvas"></canvas>
    </div>
    <div class="p-portfolio-intro__journey">
      <?php get_template_part("template-parts/portfolio-hero"); ?>
    </div>
    <?php get_template_part("template-parts/portfolio-about"); ?>
    <?php get_template_part("template-parts/portfolio-skills"); ?>
    <?php get_template_part("template-parts/portfolio-works"); ?>
    <?php get_template_part("template-parts/portfolio-experience"); ?>
    <?php get_template_part("template-parts/portfolio-study"); ?>
    <?php get_template_part("template-parts/portfolio-contact"); ?>
    <?php get_template_part("template-parts/footer"); ?>
  </div>
</main>
<?php get_footer(null, ["portfolio_footer_rendered" => true]); ?>
