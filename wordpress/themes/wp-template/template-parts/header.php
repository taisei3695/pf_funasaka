<header class="p-portfolio-header">
  <div class="p-portfolio-header__inner">
    <a class="p-portfolio-header__brand" href="<?php echo esc_url(home_url("/")); ?>">TAISEI FUNASAKA</a>
    <nav class="p-portfolio-header__nav" aria-label="メインナビゲーション">
      <?php foreach (["about" => "ABOUT", "works" => "WORKS", "experience" => "EXPERIENCE", "skills" => "SKILLS", "contact" => "CONTACT"] as $anchor => $label): ?>
        <a href="<?php echo esc_url(portfolio_build_section_url($anchor)); ?>"><?php echo esc_html($label); ?></a>
      <?php endforeach; ?>
    </nav>
  </div>
</header>
