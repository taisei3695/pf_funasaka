<?php get_header(); ?>
<main id="main" class="l-main l-main--ambient">
  <?php get_template_part("template-parts/portfolio-backdrop", null, ["variant" => "detail"]); ?>
  <?php while (have_posts()):
    the_post();
    get_template_part("template-parts/portfolio-work-detail", null, ["id" => get_the_ID()]);
  endwhile; ?>
</main>
<?php get_footer(); ?>
