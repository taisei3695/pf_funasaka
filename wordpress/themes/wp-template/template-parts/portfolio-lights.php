<div class="c-light-stage js-light-stage <?php echo !empty($args["contact"]) ? "c-light-stage--contact" : ""; ?>" aria-hidden="true">
  <div class="c-light-stage__grid">
    <?php for ($row = 0; $row < 7; $row++): ?>
      <?php for ($column = 0; $column < 14; $column++): ?>
        <span class="c-light" data-light-row="<?php echo esc_attr($row); ?>" data-light-column="<?php echo esc_attr($column); ?>"></span>
      <?php endfor; ?>
    <?php endfor; ?>
  </div>
</div>
