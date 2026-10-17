<section id="skills" class="p-portfolio-section p-portfolio-skills" aria-labelledby="skills-title">
  <div class="l-portfolio-inner">
    <h2 id="skills-title" class="p-portfolio-section__title js-fade-up">SKILLS</h2>
    <?php get_template_part("template-parts/portfolio-light-cue"); ?>
    <p class="p-portfolio-section__intro">使用してきた技術と、実際に担当してきたこと。</p>
    <p class="p-portfolio-section__note" id="skills-experience-note">経験年数は学習・制作期間を含む目安です。各技術の実務経験の有無は別に記載しています。</p>
    <ul class="p-portfolio-skills__list" aria-describedby="skills-experience-note">
      <?php foreach (portfolio_list_skill_experience() as $skill): ?>
        <li class="p-portfolio-skill">
          <p class="p-portfolio-skill__category"><?php echo esc_html($skill["category"]); ?></p>
          <div class="p-portfolio-skill__heading"><h3><?php echo esc_html($skill["name"]); ?></h3><p class="p-portfolio-skill__years"><?php echo esc_html($skill["years"]); ?></p></div>
          <p class="p-portfolio-skill__context"><?php echo esc_html($skill["context"]); ?></p>
          <p class="p-portfolio-skill__description"><?php echo esc_html($skill["description"]); ?></p>
        </li>
      <?php endforeach; ?>
    </ul>
    <div class="p-portfolio-skills__additional">
      <h3>案件に合わせて学習し、実装・納品した技術</h3>
      <p class="p-portfolio-section__note">案件ごとに必要な技術を学習し、以下の実装・納品を経験しました。</p>
      <dl>
        <div><dt>Shopify / Liquid</dt><dd>支給デザインに基づく既存テーマのカスタマイズ・レスポンシブ対応</dd></div>
        <div><dt>STUDIO</dt><dd>支給デザインに基づくサイト実装・PC、タブレット、スマートフォン対応</dd></div>
      </dl>
      <p class="p-portfolio-skills__tools">その他の使用経験：ACF / Contact Form 7 / Eclipse</p>
    </div>
  </div>
</section>
