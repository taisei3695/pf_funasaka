# 関数命名の適用・全体確認

実施日：2026-10-03

[参照記事](https://ai.itokoba.com/archives/871/)に基づき、関数名の動詞を実際の処理、戻り値、副作用に合わせた。関数の挙動は維持し、定義と参照を同期した。

## 確認範囲

| 対象 | 確認内容 |
| --- | --- |
| JavaScript 28ファイル | 独自の名前付き関数130定義（119種類）、import／export、匿名callback107件、pluginなどの固定method6件 |
| WordPressテーマ・seed | 独自PHP関数71件。55件改名、16件維持。テンプレート・hook callback・function_existsの参照を同期 |
| bin内のPHPテンプレート | 名前付き関数3件。複数カテゴリーIDの列挙関数1件を改名 |
| Sass | ユーザー指定のfluid関数1件。指定名と計算方法を維持 |
| PowerShell・設定 | yarn.ps1は独自関数宣言なし。Viteのplugin factoryのimport名と呼び出し名を同期 |
| 規約・文書 | AGENTS.md、coding-guidelines.md、README、画像URL helperの使用例を同期 |

JavaScriptの名前付き定義はファイルごとに数えた。複数のCLIで使うmainなどの同名定義を含む。匿名callbackや固定hook名を、新たな名前付き関数へ機械的に変更していない。

改名はフロントJavaScript5件、開発用JavaScript50件、PHP55件、PHPテンプレート1件の計111件。node_modules、第三者のTGMPAコード、生成されたbundleは編集対象外。

## 検証結果

- フロント2ファイル：改名前後のAST・tokenを比較し、指定した5関数名の変更以外の差分なし。
- binの18ファイル：改名前のHEADに改名を適用したASTと現在のASTが一致。
- PHPの20変更ファイル：逆置換比較に成功。改名、関連コメント8箇所、診断ラベル3箇所以外の差分なし。
- option／meta／ACFの保存済みキー、URL、引数と戻り値の契約を維持。旧関数の呼び出し・callback参照は残存0件。
- JavaScript全28ファイルのローカルimport51件について、参照ファイルとexportの整合性を確認。
- フロント・bin・Vite設定のESLint／Prettierが成功。
- 独自テーマPHP60ファイルとseedのPHP構文検査が成功。
- yarn build:wpが成功。変更前と同じCSS・JavaScriptのbundle hashが生成された。
- WordPress上で改名したPHP55関数がcallable。改名後のcallback29登録を確認し、旧callback登録は0件。
- 公開実績3件の公開判定・データ取得・画像HTML生成が正常。非認証状態のprivate判定はfalse、private実績一覧は0件。
- Gmail取得関数は保存済みportfolio_contact_emailオプションと一致。
- ブラウザーでトップ、Works一覧、Next Realty詳細を巡回。詳細画像の読み込み成功、横スクロール・console errorなし。

検証中にDB初期化、投稿作成、インポート、プラグイン同期などの更新操作は実行していない。検証対象は今回の命名変更と呼び出しの整合性。

## 維持した規約と戻り値

WordPressのenqueue／register、ViteのbuildStartなどの固定hook、CLIのmain、初期化のinitPortfolioMotion、演出のfadeIn／fadeOut、ユーザー指定のfluidは既存の役割を優先した。DOMやライブラリの標準APIも維持した。

不在時の既存契約は、find_file_versionではnull、portfolio_find_work_dataでは空配列、portfolio_find_private_image_pathではfalse、find_category_urlでは#となる。命名の適用に伴う例外の追加や戻り値の変更は行っていない。

portfolio_contact_emailという旧名は、保存済みWordPress optionキーとして意図的に残る。関数名はportfolio_get_contact_emailへ改名した。

## フロントJavaScriptの改名

| 変更前 | 変更後 |
| --- | --- |
| animate | runAnimation |
| frame | updateAnimationFrame |
| throttle | debounce |
| rememberDisplay | ensureOriginalDisplay |
| switchViewport | updateViewportContent |

throttleの実装は呼び出しのたびにタイマーを取り消して遅延実行するdebounceだった。名前を実装へ合わせ、タイマーの処理は変更していない。

## 開発用JavaScriptの改名

| 変更前 | 変更後 |
| --- | --- |
| checkNode | assertNodeVersion |
| checkYarn | assertYarnVersion |
| check_docker | validate_docker_state |
| check_docker_compose | validate_docker_compose |
| check_node | validate_node_version |
| check_plugin_sync | validate_plugin_sync |
| check_port | validate_port_availability |
| check_theme_dir_match | validate_theme_dir_match |
| check_theme_slug | validate_theme_slug |
| check_yarn | validate_yarn_version |
| cleanupPreImportBackups | deleteExcessPreImportBackups |
| cleanupTmpFiles | deleteTmpFiles |
| collect_results | run_diagnostics |
| convertAndCopyImages | convertAndCopyImage |
| convertAndOptimizeImages | createViteImageOptimizationPlugin |
| convertExistingImages | convertAndCopyExistingImages |
| copyToWordPress | copyImageToWordPress |
| createDefaultStyleCssContent | generateDefaultStyleCssContent |
| createThemeName | generateThemeName |
| detectExistingThemeName | findExistingThemeName |
| docker | runDockerCommand |
| ensureEvalScript | writeEvalScript |
| ensureWordPressEnvRunning | assertWordPressEnvRunning |
| error | logError |
| exists | isPathPresent |
| existsOnWpOrg | isPluginOnWpOrg |
| extractCoveredSlugs | listCoveredPluginSlugs |
| extractSlugFromEntry | parsePluginSlug |
| find_style_theme_dirs | list_style_theme_dirs |
| getCategories | listCategories |
| getChangePreviewItems | buildChangePreviewItems |
| getInstalledSlugs | listInstalledSlugs |
| getStyleCssChangePreview | buildStyleCssChangePreview |
| getWpEnvConfigUpdate | buildWpEnvConfigUpdate |
| loadConfig | loadWordPressOptionsConfig |
| loadProjectConfig | readProjectConfig |
| loadSeedPosts | readSeedPosts |
| normalizeCategories | formatCategoryIds |
| normalizeStringArray | formatSortedStringArray |
| onAdd | handleScssAdded |
| onUnlink | handleScssRemoved |
| renameThemeDirectory | ensureThemeDirectoryMatchesConfig |
| resolveThemeConfig | buildThemeConfig |
| splitTopLevelRecords | parseInsertRecords |
| success | logSuccess |
| toPosixPath | convertToPosixPath |
| updateWordPressDatabase | updateWordPressThemeOptions |
| validateThemeSlug | assertValidThemeSlug |
| vitePluginUpdateStyleCss | createViteStyleCssPlugin |
| write_json | print_json |

## PHPの改名

| 変更前 | 変更後 |
| --- | --- |
| add_custom_page_body_classes | apply_custom_page_body_classes |
| add_font_preconnect | apply_font_preconnect_markup |
| add_page_structured_data | build_page_structured_data |
| add_simple_structured_data | print_simple_structured_data |
| add_vite_module_attribute | apply_vite_module_attribute |
| add_vite_scripts | enqueue_vite_assets |
| assets_path | print_assets_url |
| category_path | find_category_url |
| change_post_labels | set_post_labels |
| change_post_menu_labels | set_post_menu_labels |
| disable_author_archive | redirect_author_archive |
| disable_comments_post_types_support | remove_comments_post_type_support |
| disable_global_styles | remove_global_styles |
| disable_global_styles_on_setup | remove_global_style_hooks_on_setup |
| disable_output | remove_emoji_and_content_filters |
| enable_post_archive_with_slug | apply_post_archive_slug |
| get_build_manifest | read_build_manifest |
| get_file_version | find_file_version |
| get_page_url | build_page_url |
| get_theme_contact_form_shortcode | build_theme_contact_form_shortcode |
| get_vite_manifest | read_vite_manifest |
| img_path | print_image_url |
| my_acf_json_load_point | my_ensure_acf_json_load_path |
| my_acf_json_save_point | my_apply_acf_json_save_path |
| my_setup | my_apply_theme_setup |
| page_path | print_page_url |
| portfolio_contact_email | portfolio_get_contact_email |
| portfolio_filter_adjacent_works | portfolio_apply_adjacent_work_visibility |
| portfolio_filter_works_sql | portfolio_apply_works_sql_visibility |
| portfolio_guard_work_queries | portfolio_apply_work_query_visibility |
| portfolio_private_guard_request | portfolio_handle_private_request |
| portfolio_private_image | portfolio_build_private_image |
| portfolio_private_image_path | portfolio_find_private_image_path |
| portfolio_private_is_authenticated | portfolio_is_private_request_authenticated |
| portfolio_private_is_editor_request | portfolio_is_editor_request |
| portfolio_private_is_request | portfolio_is_private_request |
| portfolio_private_register_routes | portfolio_register_private_routes |
| portfolio_private_serve_image | portfolio_serve_private_image |
| portfolio_private_server_setting | portfolio_get_private_server_setting |
| portfolio_private_works | portfolio_list_private_works |
| portfolio_public_works | portfolio_list_public_works |
| portfolio_section_url | portfolio_build_section_url |
| portfolio_sync_visibility_meta | portfolio_handle_work_visibility_meta_change |
| portfolio_work_can_view | portfolio_can_view_work |
| portfolio_work_data | portfolio_find_work_data |
| portfolio_work_image | portfolio_build_work_image |
| portfolio_work_insert_status | portfolio_apply_work_insert_status |
| portfolio_work_is_public | portfolio_is_public_work |
| portfolio_work_permalink | portfolio_apply_work_permalink |
| portfolio_work_visibility | portfolio_get_work_visibility |
| portfolio_work_visibility_clause | portfolio_build_work_visibility_clause |
| restrict_rest_user_endpoints | remove_rest_user_endpoints |
| temp_path | print_theme_url |
| uploads_path | print_uploads_url |
| wpcf7_autop_return_false | wpcf7_should_autop |

## PHPテンプレートの改名

| 変更前 | 変更後 |
| --- | --- |
| resolve_category_ids | list_category_ids |

## ローカルの検証証跡

- .cache/js-naming-audit-result.json：AST・token、import／exportの検証結果
- .cache/js-function-inventory.json：JavaScript関数の一覧
- .cache/bin-function-renames.json：開発用スクリプトの対応表と差分証跡
- .cache/php-function-rename-verification.json：PHPの改名と保存済みキーの検証結果
- .cache/php-naming-lint.json：PHPファイル別の構文検査結果
- work/naming-review/wp-naming-check.json：WordPress上の読み取り検証結果
- work/naming-review/next-realty-verified.jpg：ブラウザー確認時の詳細ページ

検証用.cacheとworkはGit管理対象外。改名一覧と結果はこの文書に記録した。
