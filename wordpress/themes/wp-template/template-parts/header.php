<header class="p-portfolio-header">
  <div class="p-portfolio-header__inner">
    <a class="p-portfolio-header__brand" href="<?php echo esc_url(home_url("/")); ?>">TAISEI FUNASAKA</a>
    <nav class="p-portfolio-header__nav" aria-label="メインナビゲーション">
      <?php foreach (["works" => "Works", "skills" => "Skills", "about" => "About", "contact" => "Contact"] as $anchor => $label): ?>
        <a href="<?php echo esc_url(portfolio_section_url($anchor)); ?>"><?php echo esc_html($label); ?></a>
      <?php endforeach; ?>
    </nav>
  </div>
</header>
