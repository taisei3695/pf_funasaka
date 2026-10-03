<section id="skills" class="p-portfolio-section p-portfolio-skills" aria-labelledby="skills-title">
  <div class="l-portfolio-inner">
    <h2 id="skills-title" class="p-portfolio-section__title js-fade-up">SKILLS</h2>
    <ul class="p-portfolio-skills__list">
      <?php foreach (["HTML", "CSS / Sass", "JavaScript", "jQuery", "PHP", "WordPress", "Git", "Figma", "Adobe XD"] as $skill): ?>
        <li><?php echo esc_html($skill); ?></li>
      <?php endforeach; ?>
    </ul>
  </div>
</section>
