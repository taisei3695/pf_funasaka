<?php
$work_id = isset($args["id"]) ? (int) $args["id"] : get_the_ID();
$work = portfolio_find_work_data($work_id);
if ($work) {
  get_template_part("template-parts/portfolio-project-summary", null, ["project" => $work, "heading_level" => $args["heading_level"] ?? 3, "image_attributes" => $args["image_attributes"] ?? []]);
}
