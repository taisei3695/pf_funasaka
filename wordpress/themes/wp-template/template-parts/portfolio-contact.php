<?php $contact_email = portfolio_contact_email(); ?>
<section id="contact" class="p-portfolio-section p-portfolio-contact" aria-labelledby="contact-title">
  <?php get_template_part("template-parts/portfolio-lights", null, ["contact" => true]); ?>
  <div class="l-portfolio-inner">
    <h2 id="contact-title" class="p-portfolio-section__title js-fade-up">CONTACT</h2>
    <p class="p-portfolio-contact__text js-fade-up">制作のご相談・ご依頼など、<br />お気軽にご連絡ください。</p>
    <?php if ($contact_email): ?>
      <a class="p-portfolio-contact__link" href="<?php echo esc_url("mailto:" . $contact_email); ?>">Gmail <span aria-hidden="true">↗</span></a>
    <?php else: ?>
      <!-- TODO: Set portfolio contact email address -->
      <span class="p-portfolio-contact__link" aria-disabled="true">Gmail <span aria-hidden="true">↗</span></span>
      <p class="p-portfolio-contact__pending">連絡先は準備中です。</p>
    <?php endif; ?>
  </div>
</section>
