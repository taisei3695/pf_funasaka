<section id="study" class="p-portfolio-section p-portfolio-study" aria-labelledby="study-title">
  <div class="l-portfolio-inner">
    <h2 id="study-title" class="p-portfolio-section__title p-portfolio-study__title js-fade-up">PERSONAL PROJECTS</h2>
    <?php get_template_part("template-parts/portfolio-light-cue"); ?>
    <p class="p-portfolio-section__note">実務案件とは別に取り組んだ、Webサイト制作やアプリ開発などをご紹介します。</p>
    <div class="p-portfolio-project-grid">
      <?php foreach (portfolio_list_public_works(2) as $work_post):

        $work = portfolio_find_work_data($work_post->ID);
        if (!$work) {
          continue;
        }
        ?>
        <?php get_template_part("template-parts/portfolio-project-summary", null, ["project" => $work]); ?>
      <?php
      endforeach; ?>
    </div>
    <div class="p-portfolio-works__more"><a href="<?php echo esc_url(get_post_type_archive_link("works")); ?>">制作実績の一覧へ <span aria-hidden="true">→</span></a></div>
  </div>
</section>
