<?php get_header(); ?>

<main class="l-main<?php echo is_privacy_policy() ? " l-main--ambient" : ""; ?>" id="main">
  <?php if (is_privacy_policy()) {
    get_template_part("template-parts/portfolio-backdrop", null, ["variant" => "privacy"]);
  } ?>
  <?php while (have_posts()):
    the_post(); ?>
    <?php if (is_privacy_policy()): ?>
      <article id="post-<?php the_ID(); ?>" <?php post_class("p-portfolio-detail p-portfolio-detail--privacy"); ?>>
        <div class="l-portfolio-inner">
          <nav class="p-portfolio-detail__breadcrumb" aria-label="パンくずリスト">
            <a href="<?php echo esc_url(home_url("/")); ?>">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page"><?php echo esc_html(get_the_title()); ?></span>
          </nav>
          <div class="p-portfolio-detail__body">
            <section>
              <header>
                <h1 class="p-portfolio-detail__title">Privacy Policy</h1>
                <?php get_template_part("template-parts/portfolio-light-cue"); ?>
                <p class="p-portfolio-detail__subtitle"><?php echo esc_html(get_the_title()); ?></p>
              </header>
            </section>
            <?php the_content(); ?>
            <nav class="p-portfolio-detail__navigation" aria-label="ページナビゲーション">
              <a href="<?php echo esc_url(home_url("/")); ?>">トップページへ戻る</a>
            </nav>
          </div>
        </div>
      </article>
    <?php else: ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class("p-page"); ?>>
      <div class="p-page__inner l-inner">
        <header class="p-page__header">
          <h1 class="p-page__title"><?php echo esc_html(get_the_title()); ?></h1>
        </header>
        <div class="p-page__content">
          <?php the_content(); ?>
        </div>
      </div>
    </article>
    <?php endif; ?>
  <?php
  endwhile; ?>
</main>

<?php get_footer();
