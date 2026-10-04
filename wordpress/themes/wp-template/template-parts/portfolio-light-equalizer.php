<?php $light_heights = [4, 7, 10, 6, 11, 8, 5, 3]; ?>
<div class="c-light-equalizer js-light-equalizer" aria-hidden="true">
  <?php for ($row = 0; $row < 12; $row++): ?>
    <?php for ($column = 0; $column < 8; $column++):

      $is_active = $row >= 12 - $light_heights[$column];
      $is_peak = $row === 12 - $light_heights[$column];
      ?>
      <span class="c-light" data-light-row="<?php echo esc_attr($row); ?>" data-light-column="<?php echo esc_attr($column); ?>" data-light-active="<?php echo $is_active ? "true" : "false"; ?>" data-light-peak="<?php echo $is_peak
  ? "true"
  : "false"; ?>"></span>
    <?php
    endfor; ?>
  <?php endfor; ?>
</div>
