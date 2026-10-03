<?php get_header(); ?>
<main id="main" class="l-main">
  <section class="p-portfolio-section p-portfolio-works" aria-labelledby="works-title">
    <div class="l-portfolio-inner">
      <h1 id="works-title" class="p-portfolio-section__title">WORKS</h1>
      <div class="p-portfolio-works__list">
        <?php if (have_posts()):
          while (have_posts()):
            the_post();
            get_template_part("template-parts/portfolio-work-card", null, ["id" => get_the_ID()]);
          endwhile;
        else:
           ?><p>公開実績は準備中です。</p><?php
        endif; ?>
      </div>
      <div class="p-portfolio-detail__navigation"><?php the_posts_pagination(["prev_text" => "← Previous", "next_text" => "Next →"]); ?><a href="<?php echo esc_url(home_url("/")); ?>">Back to Home</a></div>
    </div>
  </section>
</main>
<?php get_footer(); ?>
