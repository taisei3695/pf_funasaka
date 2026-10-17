<section id="experience" class="p-portfolio-section p-portfolio-experience" aria-labelledby="experience-title">
  <div class="l-portfolio-inner">
    <h2 id="experience-title" class="p-portfolio-section__title js-fade-up">EXPERIENCE</h2>
    <?php get_template_part("template-parts/portfolio-light-cue"); ?>
    <p class="p-portfolio-section__intro">業務システムの開発・改修から、大学校での組み込み・アプリ開発まで。<br />取り組んできたことと、自分が担当した範囲をご紹介します。</p>
    <div class="p-portfolio-experience__group">
      <div class="p-portfolio-experience__heading">
        <p class="p-portfolio-eyebrow">System Development Experience</p>
        <h3>システムエンジニア・プログラマー</h3>
        <p class="p-portfolio-experience__period">2017年4月〜2019年6月 / 約2年3か月</p>
        <p>システム開発会社にて、農業・製造業向け業務管理システムの開発に従事。新規機能の開発から既存システムの改修、データベース処理、不具合調査、テストまで担当しました。</p>
      </div>
      <div class="p-portfolio-project-grid">
        <?php foreach (portfolio_list_system_projects() as $project) {
          get_template_part("template-parts/portfolio-project-summary", null, ["project" => $project, "heading_level" => 4]);
        } ?>
      </div>
    </div>
    <div class="p-portfolio-experience__group">
      <div class="p-portfolio-experience__heading">
        <p class="p-portfolio-eyebrow">Academic Projects</p>
        <h3>東海職業能力開発大学校での開発</h3>
        <p class="p-portfolio-experience__period">4年間 / 電子回路設計・組み込み技術・プログラミング</p>
        <p>電子回路設計や組み込み技術を中心に学び、卓球練習用ラリーマシンや、Javaと方位センサーを活用した天体アプリの開発に取り組みました。</p>
      </div>
      <div class="p-portfolio-project-grid">
        <?php foreach (portfolio_list_academic_projects() as $project) {
          get_template_part("template-parts/portfolio-project-summary", null, ["project" => $project, "heading_level" => 4]);
        } ?>
      </div>
    </div>
    <div class="p-portfolio-works__more"><a href="<?php echo esc_url(get_post_type_archive_link("works")); ?>">制作実績の一覧へ <span aria-hidden="true">→</span></a></div>
  </div>
</section>
