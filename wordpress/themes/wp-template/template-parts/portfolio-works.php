<section id="works" class="p-portfolio-section p-portfolio-works" aria-labelledby="works-title">
  <div class="l-portfolio-inner">
    <h2 id="works-title" class="p-portfolio-section__title js-fade-up">WORKS</h2>
    <div class="p-portfolio-works__list">
      <?php foreach (portfolio_list_public_works(3) as $work_post) {
        get_template_part("template-parts/portfolio-work-card", null, ["id" => $work_post->ID]);
      } ?>
    </div>
    <div class="p-portfolio-works__more"><a href="<?php echo esc_url(get_post_type_archive_link("works")); ?>">All Works <span aria-hidden="true">→</span></a></div>
  </div>
</section>
