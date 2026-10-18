<?php get_header(); ?>
<main id="main" class="l-main l-main--ambient">
  <?php get_template_part("template-parts/portfolio-backdrop", null, ["variant" => "list"]); ?>
  <section class="p-portfolio-section p-portfolio-works" aria-labelledby="works-title">
    <div class="l-portfolio-inner">
      <h1 id="works-title" class="p-portfolio-section__title">WORKS</h1>
      <?php get_template_part("template-parts/portfolio-light-cue"); ?>
      <p class="p-portfolio-section__intro">制作実績・開発経験</p>
      <p class="p-portfolio-section__note">Web制作・保守、業務システム、大学校での開発、個人制作をご紹介します。担当業務や実装内容は各詳細ページをご覧ください。</p>
      <p><a class="p-portfolio-text-link" href="<?php echo esc_url(portfolio_build_section_url("works")); ?>">実務案件を見る <span aria-hidden="true">→</span></a></p>
      <div class="p-portfolio-project-grid">
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
