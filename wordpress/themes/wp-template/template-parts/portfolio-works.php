<section id="works" class="p-portfolio-section p-portfolio-works" aria-labelledby="works-title">
  <div class="l-portfolio-inner">
    <h2 id="works-title" class="p-portfolio-section__title js-fade-up">WORKS</h2>
    <?php get_template_part("template-parts/portfolio-light-cue"); ?>
    <p class="p-portfolio-section__intro">Web制作会社などからの依頼を通じて、WordPressを中心とした<br />Webサイト制作・保守に携わっています。</p>
    <p class="p-portfolio-section__note">守秘義務および公開範囲への配慮から、実務案件のクライアント名・サイトURL・画面画像は掲載していません。</p>
    <div class="p-portfolio-project-grid">
      <?php foreach (portfolio_list_professional_projects() as $project) {
        get_template_part("template-parts/portfolio-project-summary", null, ["project" => $project]);
      } ?>
    </div>
    <div class="p-portfolio-works__studies">
      <p class="p-portfolio-eyebrow">Study Projects</p>
      <h3 class="p-portfolio-works__study-title">学習・自主制作</h3>
      <p class="p-portfolio-section__note">実務案件とは別に、コーディングやWordPress構築の学習で制作したサイトをご紹介します。</p>
      <div class="p-portfolio-project-grid">
        <?php foreach (portfolio_list_public_works(2) as $work_post):

          $work = portfolio_find_work_data($work_post->ID);
          if (!$work) {
            continue;
          }
          ?>
          <?php get_template_part("template-parts/portfolio-project-summary", null, ["project" => $work, "heading_level" => 4]); ?>
        <?php
        endforeach; ?>
      </div>
      <div class="p-portfolio-works__more"><a href="<?php echo esc_url(get_post_type_archive_link("works")); ?>">制作実績の一覧へ <span aria-hidden="true">→</span></a></div>
    </div>
  </div>
</section>
