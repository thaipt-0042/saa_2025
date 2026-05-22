from __future__ import annotations



from lib.templates.base import BaseSlideTemplate
from lib.templates.base import ShapeTarget
from lib.templates.base import SlideConfig




class SVNProposalTemplate(BaseSlideTemplate):
    """Configuration for SVN Proposal Template (71 slides)"""

    def _initialize_configs(self):
        """Initialize configurations for all slides"""

        # SLIDE 4: System Overview (プロジェクト背景) YOUR ANALYSIS
        self.slide_configs[4] = SlideConfig(
            slide_number=4,
            layout_type='two_column_custom',
            content_types=['text'],
            placeholder_count=1,
            has_title=False,  # Uses shape[1] as subtitle
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;411;p72',  # Shape 4
                    shape_index=3,  # 0-based index
                    content_key='current_issues',
                    description='現状の課題 - Current Issues section',
                ),
                ShapeTarget(
                    shape_name='Google Shape;414;p72',  # Shape 7
                    shape_index=6,  # 0-based index
                    content_key='objectives',
                    description='目的・実現したいこと - Objectives section',
                ),
            ],
            description='System Overview - Two column layout with specific shape targets',
            notes="""
            Shape 4 (index 3): Fill with 'current_issues' content from markdown
            Shape 7 (index 6): Fill with 'objectives' content from markdown

            Markdown format expected:
            <!-- FILL_SLIDE: 4 -->
            <!-- SHAPE: current_issues -->
            [Content for current issues...]

            <!-- SHAPE: objectives -->
            [Content for objectives...]
            """,
        )

        # SLIDE 5: 機能一覧表 (Feature List) WITH DESCRIPTION AND TABLE
        self.slide_configs[5] = SlideConfig(
            slide_number=5,
            layout_type='content_with_text',
            content_types=['text', 'table'],
            placeholder_count=2,
            has_title=True,
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;423;p73',  # Shape 4 - Description text
                    shape_index=3,  # 0-based index
                    content_key='feature_description',
                    description='機能一覧表の説明 - Feature list description',
                ),
                ShapeTarget(
                    shape_name='Google Shape;437;p74',  # Shape 9 - TABLE (6 rows × 6 columns)
                    shape_index=8,  # 0-based index (Shape 9/9)
                    content_key='function_summary',
                    description='機能一覧テーブル - Function summary table data',
                ),
            ],
            description='Feature list slide with description text and function summary table',
            notes="""
            Shape 4 (index 3): Fill with 'feature_description' - text description
            Shape 9 (index 8): Fill with 'function_summary' - table data in markdown format

            Markdown format expected:
            <!-- FILL_SLIDE: 5 -->
            <!-- SHAPE: feature_description -->
            [Description text for feature list...]

            <!-- SHAPE: function_summary -->
            | No | カテゴリ | PID | 画面・機能 | 機能要件 | 詳細 |
            |----|---------|----|------------|----------|------|
            | 1  | ...     | .. | ...        | ...      | ...  |

            Note: Table shape exists in template at index 8 (Shape 9/9) with 6 rows × 6 columns
            Table will automatically add rows if data has more rows than template
            """,
        )

        # SLIDE 6: 非機能要件 (Non-functional Requirements) - With table
        self.slide_configs[6] = SlideConfig(
            slide_number=6,
            layout_type='table',
            content_types=['text', 'table'],
            placeholder_count=2,
            has_title=True,
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;435;p74',  # Shape 2 - Description text
                    shape_index=2,  # 0-based index
                    content_key='requirements_description',
                    description='非機能要件の説明 - Non-functional requirements description',
                ),
                ShapeTarget(
                    shape_name='Google Shape;437;p74',  # Shape 4 - TABLE (15 rows x 5 cols)
                    shape_index=4,  # 0-based index
                    content_key='requirements_table',
                    description='非機能要件テーブル - Non-functional requirements table data',
                ),
            ],
            description="""
            Slide 6: 非機能要件 (Non-functional Requirements)

            Markdown format:
            <!-- FILL_SLIDE: 6 -->

            <!-- SHAPE: requirements_description -->
            [Description text about non-functional requirements...]

            <!-- SHAPE: requirements_table -->
            | # | カテゴリ | 項目 | 概要 | 備考 |
            |---|----------|------|------|------|
            | 1 | Data 1   | Data 2   | Data 3   | Data 4 |
            | 2 | Data 5   | Data 6   | Data 7   | Data 8 |

            Note: Table shape exists in template at index 4 with 15 rows x 5 cols
            """,
        )

        # SLIDE 8: UIデザイン 画面遷移図 (Screen Transition Diagram)
        # Layout: BLANK_2_3_1_1_2 (4 shapes)
        # Structure:
        #   - Shape 0: Google Shape;457;p76  AUTO_SHAPE - large background rectangle (23.667 × 10.958 cm)
        #   - Shape 1: Google Shape;458;p76  SUBTITLE   - "System Overview | UI Mockup デザイン"
        #   - Shape 2: Google Shape;459;p76  TITLE      - "UIデザイン　画面遷移図"
        #   - Shape 3: Hình ảnh 1           PICTURE    - image placeholder (10.647 × 10.71 cm)
        #
        # To embed a screen flow diagram PNG, supply 'screen_flow_image' as:
        #   - base64 data URI: data:image/png;base64,...  (recommended for remote use)
        #   - local file path: /path/to/image.png         (local only)
        # Use the encode_image_for_slide MCP tool to encode a local PNG.
        self.slide_configs[8] = SlideConfig(
            slide_number=8,
            layout_type='image_fullscreen',
            content_types=['image'],
            placeholder_count=0,
            has_title=True,
            shape_targets=[
                ShapeTarget(
                    shape_name='Hình ảnh 1',  # PICTURE (13) shape — image placeholder
                    shape_index=3,             # 0-based index
                    content_key='screen_flow_image',
                    description='画面遷移図画像 — Screen flow diagram image (base64 data URI or file path)',
                ),
            ],
            description='Slide 8: UIデザイン 画面遷移図 — Screen transition diagram. Embed PNG of the screen flow.',
            notes="""
            Shape 3 (index 3): Fill with 'screen_flow_image' — base64 data URI or file path to PNG.
            Use the encode_image_for_slide MCP tool to convert a local PNG to base64.

            Markdown format:
            <!-- FILL_SLIDE: 8 -->
            <!-- SHAPE: screen_flow_image -->
            data:image/png;base64,iVBORw0KGgo...

            Image placeholder: left=7.033cm, top=2.286cm, width=10.647cm, height=10.71cm
            The image is overlaid on top of the PICTURE placeholder shape.
            """,
        )

        # SLIDE 10: システム導入後のフロー (System Flow After Introduction)
        # Layout: BLANK_2_3_1_1 (28 shapes)
        # Structure:
        #   - Left  : "Process" column header + 4 category labels (受付/発注/入荷/送付) — FILLABLE
        #   - Center: "導入前" column header + 8 old-process step TEXT_BOXes (nested in GROUP)
        #   - Right : "導入後" column header + 4 benefit sections (title + body) in GROUP shapes
        #
        #   Most editable shapes live inside GROUP shapes.
        #     ShapeTargets for group-nested shapes use shape_name only (no shape_index) so
        #     that the renderer performs a recursive group-child search via _find_shape_recursive.
        #     Top-level shapes use shape_index for faster lookup.
        self.slide_configs[10] = SlideConfig(
            slide_number=10,
            layout_type='process_flow_comparison',
            content_types=['text'],
            placeholder_count=2,
            has_title=True,
            shape_targets=[
                # ── Process category labels (left column) ───────────────────────
                ShapeTarget(
                    shape_name='Google Shape;477;p78',   # "受付" label (top-level)
                    shape_index=5,
                    content_key='category_label_1',
                    description='1st process category label (e.g. "受付" → "注文受付")',
                ),
                ShapeTarget(
                    shape_name='Google Shape;481;p78',   # "発注" label (top-level)
                    shape_index=9,
                    content_key='category_label_2',
                    description='2nd process category label (e.g. "発注" → "仕入発注")',
                ),
                ShapeTarget(
                    shape_name='Google Shape;479;p78',   # "入荷" label (top-level)
                    shape_index=7,
                    content_key='category_label_3',
                    description='3rd process category label (e.g. "入荷" → "商品入荷")',
                ),
                ShapeTarget(
                    shape_name='Google Shape;478;p78',   # "送付" label (top-level)
                    shape_index=6,
                    content_key='category_label_4',
                    description='4th process category label (e.g. "送付" → "出荷送付")',
                ),
                # ── 導入前 (Before) process steps — 8 steps, top → bottom ──────────
                ShapeTarget(
                    shape_name='Google Shape;529;p78',   # Step 1 (category 1)
                    content_key='before_step_1',
                    description='導入前 Step 1: 旧プロセス最初のステップ e.g. 電話での受付',
                ),
                ShapeTarget(
                    shape_name='Google Shape;508;p78',   # Step 2 (category 1)
                    content_key='before_step_2',
                    description='導入前 Step 2: e.g. 案件情報の現行システムAへの登録',
                ),
                ShapeTarget(
                    shape_name='Google Shape;511;p78',   # Step 3 (category 2)
                    content_key='before_step_3',
                    description='導入前 Step 3: e.g. 商品発注書の送付（FAX）',
                ),
                ShapeTarget(
                    shape_name='Google Shape;514;p78',   # Step 4 (category 2)
                    content_key='before_step_4',
                    description='導入前 Step 4: e.g. 商品請求書の受信と現行システムBへの登録',
                ),
                ShapeTarget(
                    shape_name='Google Shape;526;p78',   # Step 5 (category 3)
                    content_key='before_step_5',
                    description='導入前 Step 5: e.g. 商品の入荷と入荷情報の現行システムCへの登録',
                ),
                ShapeTarget(
                    shape_name='Google Shape;517;p78',   # Step 6 (category 3)
                    content_key='before_step_6',
                    description='導入前 Step 6: e.g. 案件情報と入荷情報の紐づけをシステムAで実施',
                ),
                ShapeTarget(
                    shape_name='Google Shape;520;p78',   # Step 7 (category 4)
                    content_key='before_step_7',
                    description='導入前 Step 7: e.g. 案件情報に基づいて商品の送付',
                ),
                ShapeTarget(
                    shape_name='Google Shape;523;p78',   # Step 8 (category 4)
                    content_key='before_step_8',
                    description='導入前 Step 8: e.g. システムCにおいて商品ステータスを更新',
                ),
                # ── 導入後 (After) benefit sections — 4 categories (title + body) ─
                ShapeTarget(
                    shape_name='Google Shape;484;p78',   # category 1 benefit title
                    content_key='after_cat1_title',
                    description='導入後 category 1 benefit title (bold accent color)',
                ),
                ShapeTarget(
                    shape_name='Google Shape;485;p78',   # category 1 benefit body
                    content_key='after_cat1_body',
                    description='導入後 category 1 benefit description (multi-line)',
                ),
                ShapeTarget(
                    shape_name='Google Shape;496;p78',   # category 2 benefit title
                    content_key='after_cat2_title',
                    description='導入後 category 2 benefit title (bold accent color)',
                ),
                ShapeTarget(
                    shape_name='Google Shape;497;p78',   # category 2 benefit body
                    content_key='after_cat2_body',
                    description='導入後 category 2 benefit description',
                ),
                ShapeTarget(
                    shape_name='Google Shape;492;p78',   # category 3 benefit title
                    content_key='after_cat3_title',
                    description='導入後 category 3 benefit title (bold accent color)',
                ),
                ShapeTarget(
                    shape_name='Google Shape;493;p78',   # category 3 benefit body
                    content_key='after_cat3_body',
                    description='導入後 category 3 benefit description',
                ),
                ShapeTarget(
                    shape_name='Google Shape;488;p78',   # category 4 benefit title
                    content_key='after_cat4_title',
                    description='導入後 category 4 benefit title (bold accent color)',
                ),
                ShapeTarget(
                    shape_name='Google Shape;489;p78',   # category 4 benefit body
                    content_key='after_cat4_body',
                    description='導入後 category 4 benefit description',
                ),
            ],
            description='System Flow After Introduction — Before/After process comparison diagram',
            notes="""
            Slide 10 (slide_index 9): システム導入後のフロー
            Layout: BLANK_2_3_1_1  |  28 top-level shapes

            ═══ VISUAL STRUCTURE ═══════════════════════════════════════════
            ┌──────────────┬──────────────────────────────┬──────────────────────┐
            │  Process     │  導入前                       │  導入後              │
            │  (col hdr)   │  (col hdr)                   │  (col hdr)           │
            │──────────────┼──────────────────────────────┼──────────────────────│
            │ category_1   │ Step 1: before_step_1        │ after_cat1_title     │
            │              │ Step 2: before_step_2        │ after_cat1_body      │
            │──────────────┼──────────────────────────────┼──────────────────────│
            │ category_2   │ Step 3: before_step_3        │ after_cat2_title     │
            │              │ Step 4: before_step_4        │ after_cat2_body      │
            │──────────────┼──────────────────────────────┼──────────────────────│
            │ category_3   │ Step 5: before_step_5        │ after_cat3_title     │
            │              │ Step 6: before_step_6        │ after_cat3_body      │
            │──────────────┼──────────────────────────────┼──────────────────────│
            │ category_4   │ Step 7: before_step_7        │ after_cat4_title     │
            │              │ Step 8: before_step_8        │ after_cat4_body      │
            └──────────────┴──────────────────────────────┴──────────────────────┘

            ═══ SHAPE LOCATION ═════════════════════════════════════════════
            Top-level (shape_index used):
              [ 5] Google Shape;477;p78  → category_label_1      "受付"
              [ 9] Google Shape;481;p78  → category_label_2      "発注"
              [ 7] Google Shape;479;p78  → category_label_3      "入荷"
              [ 6] Google Shape;478;p78  → category_label_4      "送付"

            Inside GROUP (shape_name recursive search):
              GROUP 505 (slide.shapes[25])
                └─ GROUP 527 → TEXT_BOX 529  ← before_step_1
                └─ GROUP 506 → TEXT_BOX 508  ← before_step_2
                └─ GROUP 509 → TEXT_BOX 511  ← before_step_3
                └─ GROUP 512 → TEXT_BOX 514  ← before_step_4
                └─ GROUP 524 → TEXT_BOX 526  ← before_step_5
                └─ GROUP 515 → TEXT_BOX 517  ← before_step_6
                └─ GROUP 518 → TEXT_BOX 520  ← before_step_7
                └─ GROUP 521 → TEXT_BOX 523  ← before_step_8

              GROUP 483 (slide.shapes[11]) → TEXT_BOX 484 (after_cat1_title)
                                           → TEXT_BOX 485 (after_cat1_body)
              GROUP 495 (slide.shapes[17]) → TEXT_BOX 496 (after_cat2_title)
                                           → TEXT_BOX 497 (after_cat2_body)
              GROUP 491 (slide.shapes[15]) → TEXT_BOX 492 (after_cat3_title)
                                           → TEXT_BOX 493 (after_cat3_body)
              GROUP 487 (slide.shapes[13]) → TEXT_BOX 488 (after_cat4_title)
                                           → TEXT_BOX 489 (after_cat4_body)

            ═══ MARKDOWN FORMAT ════════════════════════════════════════════
            <!-- FILL_SLIDE: 10 -->

            <!-- SHAPE: category_label_1 -->
            受付

            <!-- SHAPE: category_label_2 -->
            発注

            <!-- SHAPE: category_label_3 -->
            入荷

            <!-- SHAPE: category_label_4 -->
            送付

            <!-- SHAPE: before_step_1 -->
            電話での受付

            <!-- SHAPE: before_step_2 -->
            案件情報の現行システムAへの登録

            <!-- SHAPE: before_step_3 -->
            商品発注書の送付（FAX）

            <!-- SHAPE: before_step_4 -->
            商品請求書の受信と現行システムBへの登録

            <!-- SHAPE: before_step_5 -->
            商品の入荷と入荷情報の現行システムCへの登録

            <!-- SHAPE: before_step_6 -->
            案件情報と入荷情報の紐づけをシステムAで実施

            <!-- SHAPE: before_step_7 -->
            案件情報に基づいて商品の送付

            <!-- SHAPE: before_step_8 -->
            システムCにおいて商品ステータスを更新

            <!-- SHAPE: after_cat1_title -->
            新規サイトでの受付

            <!-- SHAPE: after_cat1_body -->
            ワンクリックでの案件情報の作成
            商品発注書の基本情報入力

            <!-- SHAPE: after_cat2_title -->
            商品発注の承認

            <!-- SHAPE: after_cat2_body -->
            商品情報の自動紐付け

            <!-- SHAPE: after_cat3_title -->
            商品入荷

            <!-- SHAPE: after_cat3_body -->
            IDにより案件情報との自動紐付け

            <!-- SHAPE: after_cat4_title -->
            商品送付

            <!-- SHAPE: after_cat4_body -->
            商品ステータスの自動更新

            ═══ CONTENT GUIDELINES ═════════════════════════════════════════
            category_label_*:
              - Short noun (2-6 chars), one per process phase
              - Align with the 4 phases in the diagram (top → bottom)
              - category_label_1 aligns with before_step_1 & before_step_2
              - category_label_2 aligns with before_step_3 & before_step_4
              - category_label_3 aligns with before_step_5 & before_step_6
              - category_label_4 aligns with before_step_7 & before_step_8

            before_step_*:
              - 1 concise line per step (max ~25 chars)
              - Describe the manual / pain-point action in the old process
              - 2 steps per category (steps 1-2 → cat1, 3-4 → cat2, etc.)

            after_cat*_title:
              - Short noun phrase (5-15 chars), bold accent color
              - Names the NEW capability for that process category

            after_cat*_body:
              - 1-3 short lines; use actual newline in the markdown block to
                produce separate paragraphs inside the template text box
            """,
        )

        # SLIDE 11: システム導入後のフロー — 横並びレイアウト (Horizontal Flow)
        # Layout: BLANK_2_3 (37 shapes)
        # Structure:
        #   - Top section (導入前): 8 before-step boxes arranged LEFT → RIGHT
        #   - Bottom section (導入後): 4 benefit blocks (title + body) LEFT → RIGHT
        #
        # ✅ All editable shapes are TOP-LEVEL — use shape_index for direct lookup.
        #    No GROUP nesting, unlike slide 10.
        self.slide_configs[11] = SlideConfig(
            slide_number=11,
            layout_type='process_flow_horizontal',
            content_types=['text'],
            placeholder_count=2,
            has_title=True,
            shape_targets=[
                # ── 導入前 (Before) — 8 step boxes, left → right ─────────────────
                ShapeTarget(
                    shape_name='Google Shape;553;p79',
                    shape_index=8,
                    content_key='before_step_1',
                    description='導入前 Step 1 (leftmost): e.g. 電話での受付',
                ),
                ShapeTarget(
                    shape_name='Google Shape;554;p79',
                    shape_index=9,
                    content_key='before_step_2',
                    description='導入前 Step 2: e.g. 案件情報の現行システムAへの登録',
                ),
                ShapeTarget(
                    shape_name='Google Shape;555;p79',
                    shape_index=10,
                    content_key='before_step_3',
                    description='導入前 Step 3: e.g. 商品発注書の送付（FAX）',
                ),
                ShapeTarget(
                    shape_name='Google Shape;556;p79',
                    shape_index=11,
                    content_key='before_step_4',
                    description='導入前 Step 4: e.g. 商品請求書の受信と現行システムBへの登録',
                ),
                ShapeTarget(
                    shape_name='Google Shape;557;p79',
                    shape_index=12,
                    content_key='before_step_5',
                    description='導入前 Step 5: e.g. 商品の入荷と入荷情報の現行システムCへの登録',
                ),
                ShapeTarget(
                    shape_name='Google Shape;558;p79',
                    shape_index=13,
                    content_key='before_step_6',
                    description='導入前 Step 6: e.g. 案件情報と入荷情報の紐づけをシステムAで実施',
                ),
                ShapeTarget(
                    shape_name='Google Shape;560;p79',
                    shape_index=15,
                    content_key='before_step_7',
                    description='導入前 Step 7: e.g. 案件情報に基づいて商品の送付',
                ),
                ShapeTarget(
                    shape_name='Google Shape;559;p79',
                    shape_index=14,
                    content_key='before_step_8',
                    description='導入前 Step 8 (rightmost): e.g. システムCにおいて商品ステータスを更新',
                ),
                # ── 導入後 (After) — 4 benefit blocks (title + body), left → right ─
                ShapeTarget(
                    shape_name='Google Shape;569;p79',
                    shape_index=24,
                    content_key='after_cat1_title',
                    description='導入後 category 1 title (bold accent): e.g. 新規サイトでの受付',
                ),
                ShapeTarget(
                    shape_name='Google Shape;576;p79',
                    shape_index=31,
                    content_key='after_cat1_body',
                    description='導入後 category 1 body (multi-line TEXT_BOX)',
                ),
                ShapeTarget(
                    shape_name='Google Shape;570;p79',
                    shape_index=25,
                    content_key='after_cat2_title',
                    description='導入後 category 2 title (bold accent): e.g. 商品発注の承認',
                ),
                ShapeTarget(
                    shape_name='Google Shape;577;p79',
                    shape_index=32,
                    content_key='after_cat2_body',
                    description='導入後 category 2 body',
                ),
                ShapeTarget(
                    shape_name='Google Shape;571;p79',
                    shape_index=26,
                    content_key='after_cat3_title',
                    description='導入後 category 3 title (bold accent): e.g. 商品入荷',
                ),
                ShapeTarget(
                    shape_name='Google Shape;578;p79',
                    shape_index=33,
                    content_key='after_cat3_body',
                    description='導入後 category 3 body',
                ),
                ShapeTarget(
                    shape_name='Google Shape;572;p79',
                    shape_index=27,
                    content_key='after_cat4_title',
                    description='導入後 category 4 title (bold accent): e.g. 商品送付',
                ),
                ShapeTarget(
                    shape_name='Google Shape;579;p79',
                    shape_index=34,
                    content_key='after_cat4_body',
                    description='導入後 category 4 body',
                ),
            ],
            description='System Flow After Introduction (Horizontal) — Before/After horizontal process diagram',
            notes="""
            Slide 11 (slide_index 10): システム導入後のフロー — 横並びレイアウト
            Layout: BLANK_2_3  |  37 top-level shapes
            Counterpart to slide 10 (vertical layout) — same content, different visual style.

            ═══ VISUAL STRUCTURE ═══════════════════════════════════════════
            ┌────────────────────────────────────────────────────────────────┐
            │ 導入前 │ Step1 → Step2 → Step3 → Step4 → Step5 → Step6 → Step7 → Step8 │
            ├────────────────────────────────────────────────────────────────┤
            │ 導入後 │  cat1 title/body  │  cat2 title/body  │  cat3 title/body  │  cat4 title/body  │
            └────────────────────────────────────────────────────────────────┘

            ═══ SHAPE INDEX MAP (all top-level) ════════════════════════════
            Before steps:
              [ 8] Google Shape;553;p79  → before_step_1   "電話での受付"
              [ 9] Google Shape;554;p79  → before_step_2   "案件情報の現行システムAへの登録"
              [10] Google Shape;555;p79  → before_step_3   "商品発注書の送付（FAX）"
              [11] Google Shape;556;p79  → before_step_4   "商品請求書の受信と現行システムBへの登録"
              [12] Google Shape;557;p79  → before_step_5   "商品の入荷と入荷情報の現行システムCへの登録"
              [13] Google Shape;558;p79  → before_step_6   "案件情報と入荷情報の紐づけをシステムAで実施"
              [15] Google Shape;560;p79  → before_step_7   "案件情報に基づいて商品の送付"
              [14] Google Shape;559;p79  → before_step_8   "システムCにおいて商品ステータスを更新"

            After titles (AUTO_SHAPE, bold accent color):
              [24] Google Shape;569;p79  → after_cat1_title  "新規サイトでの受付"
              [25] Google Shape;570;p79  → after_cat2_title  "商品発注の承認"
              [26] Google Shape;571;p79  → after_cat3_title  "商品入荷"
              [27] Google Shape;572;p79  → after_cat4_title  "商品送付"

            After bodies (TEXT_BOX, supports multi-line):
              [31] Google Shape;576;p79  → after_cat1_body
              [32] Google Shape;577;p79  → after_cat2_body
              [33] Google Shape;578;p79  → after_cat3_body
              [34] Google Shape;579;p79  → after_cat4_body

            Fixed (not filled):
              [ 4] Google Shape;549;p79  "導入前" section header
              [35] Google Shape;580;p79  "導入後" section header
              [36] Google Shape;581;p79  PICTURE (arrow/decoration image)
              [16–23, 28–30]            LINE shapes (arrows between steps)
              [ 5– 7, 16]               Background block shapes

            ═══ MARKDOWN FORMAT ════════════════════════════════════════════
            <!-- FILL_SLIDE: 11 -->

            <!-- SHAPE: before_step_1 -->
            電話での受付

            <!-- SHAPE: before_step_2 -->
            案件情報の現行システムAへの登録

            <!-- SHAPE: before_step_3 -->
            商品発注書の送付（FAX）

            <!-- SHAPE: before_step_4 -->
            商品請求書の受信と現行システムBへの登録

            <!-- SHAPE: before_step_5 -->
            商品の入荷と入荷情報の現行システムCへの登録

            <!-- SHAPE: before_step_6 -->
            案件情報と入荷情報の紐づけをシステムAで実施

            <!-- SHAPE: before_step_7 -->
            案件情報に基づいて商品の送付

            <!-- SHAPE: before_step_8 -->
            システムCにおいて商品ステータスを更新

            <!-- SHAPE: after_cat1_title -->
            新規サイトでの受付

            <!-- SHAPE: after_cat1_body -->
            ワンクリックでの案件情報の作成
            商品発注書の基本情報入力

            <!-- SHAPE: after_cat2_title -->
            商品発注の承認

            <!-- SHAPE: after_cat2_body -->
            商品情報の自動紐付け

            <!-- SHAPE: after_cat3_title -->
            商品入荷

            <!-- SHAPE: after_cat3_body -->
            IDにより案件情報との自動紐付け

            <!-- SHAPE: after_cat4_title -->
            商品送付

            <!-- SHAPE: after_cat4_body -->
            商品ステータスの自動更新

            ═══ CONTENT GUIDELINES ═════════════════════════════════════════
            before_step_*:
              - 1 concise phrase per box (max ~20 chars fits the horizontal box width)
              - Steps flow left → right, ordered 1 → 8
              - Use vertical bar \\u000b (vertical tab) for line breaks within the box
                e.g. "案件情報の\\u000b現行システムAへの登録"

            after_cat*_title:
              - Short bold title (5-12 chars), describes the NEW capability
              - 4 titles correspond left-to-right to the 4 after-section blocks

            after_cat*_body:
              - 1-3 short lines; use actual newline between lines
              - cat1_body supports 2 lines (box is taller)
              - cat2/3/4_body typically 1 line each

            Relationship to slide 10:
              - Slide 10 uses vertical flow (top→bottom) with GROUP-nested shapes
              - Slide 11 uses horizontal flow (left→right) with flat top-level shapes
              - Both slides convey the same before/after process comparison
              - Use slide 10 for vertical layout preference, slide 11 for horizontal
            """,
        )

        # SLIDE 12: システムの導入のメリット (System Benefits) TWO SECTIONS
        self.slide_configs[12] = SlideConfig(
            slide_number=12,
            layout_type='two_section_benefits',
            content_types=['text'],
            placeholder_count=4,
            has_title=True,
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;588;p80',  # Shape 3 - Title for section 1
                    shape_index=2,  # 0-based index
                    content_key='benefit_title_1',
                    description='削減されるコスト - Cost reduction title',
                ),
                ShapeTarget(
                    shape_name='Google Shape;589;p80',  # Shape 4 - Content for section 1
                    shape_index=3,  # 0-based index
                    content_key='benefit_content_1',
                    description='削減されるコスト - Cost reduction content (2 lines)',
                ),
                ShapeTarget(
                    shape_name='Google Shape;590;p80',  # Shape 5 - Title for section 2
                    shape_index=4,  # 0-based index
                    content_key='benefit_title_2',
                    description='業務効率 - Business efficiency title',
                ),
                ShapeTarget(
                    shape_name='Google Shape;591;p80',  # Shape 6 - Content for section 2
                    shape_index=5,  # 0-based index
                    content_key='benefit_content_2',
                    description='業務効率 - Business efficiency content (2 lines)',
                ),
            ],
            description='System Benefits - Two section layout with titles and content',
            notes="""
            Shape 3 (index 2): Fill with 'benefit_title_1' - Section 1 title
            Shape 4 (index 3): Fill with 'benefit_content_1' - Section 1 content (2 lines)
            Shape 5 (index 4): Fill with 'benefit_title_2' - Section 2 title
            Shape 6 (index 5): Fill with 'benefit_content_2' - Section 2 content (2 lines)

            Markdown format expected:
            <!-- FILL_SLIDE: 12 -->

            <!-- SHAPE: benefit_title_1 -->
            削減されるコスト

            <!-- SHAPE: benefit_content_1 -->
            作業の自動化により人的コストを削減し、入力ミスや再作業の発生も抑制されます。
            また、クラウド活用により、サーバーやインフラ費用を最小限に抑えることができます。

            <!-- SHAPE: benefit_title_2 -->
            業務効率

            <!-- SHAPE: benefit_content_2 -->
            手作業の削減により処理時間が短縮され、従業員はコア業務に集中できます。
            業務プロセスの標準化により、作業の属人化を防ぎ、チーム全体の生産性を向上します。
            """,
        )

        # SLIDE 13: システムの導入のメリット (System Benefits - Continued) TWO MORE SECTIONS
        self.slide_configs[13] = SlideConfig(
            slide_number=13,
            layout_type='two_section_benefits',
            content_types=['text'],
            placeholder_count=4,
            has_title=True,
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;598;p81',  # Shape 3 - Title for section 3
                    shape_index=2,  # 0-based index
                    content_key='benefit_title_3',
                    description='向上するセキュリティ - Security improvement title',
                ),
                ShapeTarget(
                    shape_name='Google Shape;599;p81',  # Shape 4 - Content for section 3
                    shape_index=3,  # 0-based index
                    content_key='benefit_content_3',
                    description='向上するセキュリティ - Security improvement content (2 lines)',
                ),
                ShapeTarget(
                    shape_name='Google Shape;600;p81',  # Shape 5 - Title for section 4
                    shape_index=4,  # 0-based index
                    content_key='benefit_title_4',
                    description='連携されるシステムとその効果 - System integration title',
                ),
                ShapeTarget(
                    shape_name='Google Shape;601;p81',  # Shape 6 - Content for section 4
                    shape_index=5,  # 0-based index
                    content_key='benefit_content_4',
                    description='連携されるシステムとその効果 - System integration content (2 lines)',
                ),
            ],
            description='System Benefits (Continued) - Two additional benefit sections',
            notes="""
            Shape 3 (index 2): Fill with 'benefit_title_3' - Section 3 title
            Shape 4 (index 3): Fill with 'benefit_content_3' - Section 3 content (2 lines)
            Shape 5 (index 4): Fill with 'benefit_title_4' - Section 4 title
            Shape 6 (index 5): Fill with 'benefit_content_4' - Section 4 content (2 lines)

            Markdown format expected:
            <!-- FILL_SLIDE: 13 -->

            <!-- SHAPE: benefit_title_3 -->
            向上するセキュリティ

            <!-- SHAPE: benefit_content_3 -->
            ユーザー権限管理やデータ暗号化により、不正アクセスや情報漏洩リスクを低減します。
            操作ログの記録により、コンプライアンス要件への対応と監査証跡の確保が可能になります。

            <!-- SHAPE: benefit_title_4 -->
            連携されるシステムとその効果

            <!-- SHAPE: benefit_content_4 -->
            既存の会計ソフトやチャットツールなどと連携し、情報の一元管理と作業効率化を実現します。
            リアルタイムデータ同期により、部門間の情報共有がスムーズになり意思決定が迅速化されます。
            """,
        )

        # SLIDE 23: お見積りの前提条件 Part 1 (Estimated Assumptions)
        # Layout: BLANK_2_3_1_1 (2 shapes)
        # Structure: 2-col TABLE (shape_index=0, name='Google Shape;857;p91')
        #   - Col 0 (FIXED): 開発方針 / 品質戦略 / 開発言語 / 機能要件 / 非機能要件
        #   - Col 1 (FILL):  content for each row
        # Markdown format: single-column table, one row per assumption item
        #   | content for 開発方針 |
        #   | content for 品質戦略 |
        #   ...
        self.slide_configs[23] = SlideConfig(
            slide_number=23,
            layout_type='assumption_table',
            content_types=['table'],
            placeholder_count=0,
            has_title=False,
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;857;p91',
                    shape_index=0,
                    content_key='assumptions_table_23',
                    fill_cols=[1],
                    description='お見積りの前提条件 Part 1 — col 0 labels are fixed, fill col 1 only (5 rows: 開発方針/品質戦略/開発言語/機能要件/非機能要件)',
                ),
            ],
            description='Slide 23: お見積りの前提条件 Part 1 (2-col table, 5 rows, fill col 1 only)',
        )

        # SLIDE 24: お見積りの前提条件 Part 2 (Estimated Assumptions continued)
        # Layout: BLANK_2_3_1_1 (2 shapes)
        # Structure: 2-col TABLE (shape_index=0, name='Google Shape;866;p92')
        #   - Col 0 (FIXED): デザイン / 外部API / その他
        #   - Col 1 (FILL):  content for each row
        self.slide_configs[24] = SlideConfig(
            slide_number=24,
            layout_type='assumption_table',
            content_types=['table'],
            placeholder_count=0,
            has_title=False,
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;866;p92',
                    shape_index=0,
                    content_key='assumptions_table_24',
                    fill_cols=[1],
                    description='お見積りの前提条件 Part 2 — col 0 labels are fixed, fill col 1 only (3 rows: デザイン/外部API/その他)',
                ),
            ],
            description='Slide 24: お見積りの前提条件 Part 2 (2-col table, 3 rows, fill col 1 only)',
        )

        # SLIDE 25: お見積りの前提条件 Part 3 (Estimated Assumptions continued)
        # Layout: BLANK_2_3_1_1 (2 shapes)
        # Structure: 2-col TABLE (shape_index=0, name='Google Shape;875;p93')
        #   - Col 0 (FIXED): インフラ
        #   - Col 1 (FILL):  content
        self.slide_configs[25] = SlideConfig(
            slide_number=25,
            layout_type='assumption_table',
            content_types=['table'],
            placeholder_count=0,
            has_title=False,
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;875;p93',
                    shape_index=0,
                    content_key='assumptions_table_25',
                    fill_cols=[1],
                    description='お見積りの前提条件 Part 3 — col 0 label is fixed, fill col 1 only (1 row: インフラ)',
                ),
            ],
            description='Slide 25: お見積りの前提条件 Part 3 (2-col table, 1 row, fill col 1 only)',
        )

        # SLIDE 21: アプローチ比較サマリ (Approach Comparison Summary) TABLE
        self.slide_configs[21] = SlideConfig(
            slide_number=21,
            layout_type='comparison_table',
            content_types=['table'],
            placeholder_count=1,
            has_title=False,
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;845;p89',  # Shape 3 - TABLE
                    shape_index=2,  # 0-based index
                    content_key='approach_comparison_table',
                    description='アプローチ比較サマリ - Approach comparison table',
                ),
            ],
            description='Approach Comparison Summary - Compare multiple system approaches',
            notes="""
            Shape 3 (index 2): Fill with 'approach_comparison_table' - Comparison table data

            Markdown format expected:
            <!-- FILL_SLIDE: 21 -->

            <!-- SHAPE: approach_comparison_table -->
            | 項目 | A案 | B案 | C案 |
            |------|-----|-----|-----|
            | アプローチ | Android既存アプリを活かしつつ、iOS版を新規開発 | Android / iOSをFlutter等で刷新 | フロント＋バックエンドを全面再構築 |
            | アプローチが成立する前提条件 | 既存Androidコードベースが保守可能 | 開発チームがFlutter習熟可能 | 十分な予算と期間が確保可能 |
            | 想定機能数 | 約50〜60機能 | 約50〜60機能 | 約50〜60機能 |
            | UXの改善度合い | Android：低 / iOS：高 | Android：高 / iOS：高 | Android：高 / iOS：高 |
            | 要件の網羅性 | 既存機能ベース | 既存機能＋改善 | 全面的な見直し |
            | pro | ・開発コストを抑えられる<br>・既存Androidへの影響が小さい<br>・iOS新機能を迅速に提供 | ・UI/UX統一<br>・保守性向上<br>・クロスプラットフォーム開発<br>・コードベース一元化 | ・技術的負債を解消<br>・将来拡張が容易<br>・最新技術スタック採用<br>・パフォーマンス最適化 |
            | con | ・UX差異が残る<br>・二重管理が継続<br>・技術的負債が残る | ・初期コスト増<br>・学習コスト発生<br>・ネイティブ機能制約あり | ・工数・コスト最大<br>・開発期間が長い<br>・リスクが高い |

            Table structure:
            - Column 1: 項目 (Item/Category)
            - Column 2-4: A案/B案/C案 (Approach A/B/C)
            - Rows: アプローチ, 前提条件, 機能数, UX改善度, 要件網羅性, pro, con
            - Use <br> for line breaks within cells
            - Keep pro/con items concise (5-7 bullet points max per cell)
            """,
        )

        # SLIDE 33: インフラ構成 (Infrastructure Configuration) TABLE
        self.slide_configs[33] = SlideConfig(
            slide_number=33,
            layout_type='infrastructure_table',
            content_types=['table'],
            placeholder_count=1,
            has_title=False,
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;966;p101',  # Shape 1 - TABLE
                    shape_index=0,  # 0-based index
                    content_key='infrastructure_configuration_table',
                    description='インフラ構成 - Infrastructure configuration table',
                ),
            ],
            description='Infrastructure Configuration - Proposed infrastructure setup',
            notes="""
            Shape 1 (index 0): Fill with 'infrastructure_configuration_table' - Infrastructure table data

            Markdown format expected:
            <!-- FILL_SLIDE: 33 -->

            <!-- SHAPE: infrastructure_configuration_table -->
            | # | カテゴリ | 提案理由 |
            |---|----------|----------|
            | 1 | 可用性・スケーラビリティ | ・ECS（マルチAZ）を採用し、ALBとヘルスチェックにより自動トラフィック分散を実現<br>・Auto Scalingにより障害時も安定稼働 |
            | 2 | データ保護・セキュリティ | ・Aurora（マルチAZ）で自動フェイルオーバー<br>・S3バックアップ＋KMS暗号化 |
            | 3 | モニタリング | ・CloudWatchでメトリクス・アラーム監視<br>・CloudTrailで操作ログを記録 |
            | 4 | コスト最適化 | ・Reserved InstancesとSpot Instancesの併用<br>・S3ライフサイクルポリシーで古いデータを自動削減 |
            | 5 | ネットワーク | ・VPC分離（Public/Private subnet）<br>・NATゲートウェイで安全な外部通信 |

            Table structure:
            - 3 columns: # (number), カテゴリ (Category), 提案理由 (Proposal Reason)
            - 5-8 rows covering key infrastructure aspects
            - Use <br> for line breaks within cells
            - Use ・ (middle dot) for bullet points
            - Focus on: 可用性, スケーラビリティ, セキュリティ, 運用性, コスト
            - Each row should propose specific cloud services (AWS/GCP/Azure) with technical rationale
            """,
        )

        # SLIDE 34: ソフトウェア構成 (Software Configuration) TABLE
        self.slide_configs[34] = SlideConfig(
            slide_number=34,
            layout_type='software_configuration_table',
            content_types=['table'],
            placeholder_count=1,
            has_title=False,
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;979;p102',  # Shape 1 - TABLE
                    shape_index=0,  # 0-based index
                    content_key='software_configuration_table',
                    description='ソフトウェア構成 - Software configuration / tech stack table',
                ),
            ],
            description='Software Configuration - Application tech stack and tooling',
            notes="""
            Shape 1 (index 0): Fill with 'software_configuration_table' - Software tech stack table

            Markdown format expected:
            <!-- FILL_SLIDE: 34 -->

            <!-- SHAPE: software_configuration_table -->
            | # | コンポーネント | 説明 |
            |---|--------------|------|
            | 1 | フロントエンド開発言語/フレームワーク | ・Next.js（React）を採用し、CSR/SSRの選択により表示性能とSEOを両立<br>・コンポーネント設計により保守性を確保し、XSS等のリスク低減に寄与 |
            | 2 | バックエンド開発言語/フレームワーク | ・NestJS（Node.js + TypeScript）で型安全なAPI開発を実現<br>・DI/モジュール構成により拡張性・テスト容易性を向上<br>・JWT/OAuth等の認証方式と親和性が高い |
            | 3 | ソースコード管理 | ・GitHubを採用し、PR運用とレビューによる品質担保を行う |
            | 4 | CI/CD | ・GitHub ActionsでLint/Test/Build/Deployを自動化し、リリースの再現性を確保 |
            | 5 | クラウドプラットフォーム | ・AWSを採用し、運用実績とマネージドサービスで安定運用を実現 |
            | 6 | インフラ管理 | ・TerraformでIaCを行い、環境差異を排除して運用負荷を削減 |
            | 7 | システムアーキテクチャ | ・モジュラーモノリス（必要に応じて段階的に分割可能）で保守性と将来拡張を両立 |

            Table structure:
            - 3 columns: # (number), コンポーネント (Component), 説明 (Description)
            - 6-8 rows covering key software components
            - Use <br> for line breaks within cells
            - Use ・ (middle dot) for bullet points
            - Focus on: 安定性 (Stability), セキュリティ (Security), 保守性 (Maintainability), 拡張性 (Scalability)

            Suggested components (adjust based on project):
            - フロントエンド開発言語/フレームワーク (Frontend language/framework)
            - バックエンド開発言語/フレームワーク (Backend language/framework)
            - ソースコード管理 (Source code management)
            - CI/CD (CI/CD pipeline)
            - クラウドプラットフォーム (Cloud platform)
            - インフラ管理（IaC） (Infrastructure management / IaC)
            - システムアーキテクチャ (System architecture)
            - Optional: テスト (Testing), 監視 (Monitoring), 認証方式 (Authentication)

            Each row should:
            - Specify concrete tech stack (e.g., "Next.js", "NestJS", "GitHub Actions")
            - Explain WHY chosen (stability, security, maintainability, extensibility)
            - Use 2-4 bullet points per component
            - Write in proposal style Japanese (formal but clear)
            """,
        )

        # Slide 35: Non-Functional Requirements (非機能要件)
        self.slide_configs[35] = SlideConfig(
            slide_number=35,
            layout_type='non_functional_requirements',
            content_types=['text'],
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;1001;p103',  # Shape 6 - Performance title
                    shape_index=5,
                    content_key='performance_title',
                    description='パフォーマンス（Performance）- Title',
                ),
                ShapeTarget(
                    shape_name='Google Shape;1002;p103',  # Shape 7 - Performance body
                    shape_index=6,
                    content_key='performance_body',
                    description='パフォーマンス（Performance）- Body with 5 bullets',
                ),
                ShapeTarget(
                    shape_name='Google Shape;1014;p103',  # Shape 19 - Maintainability title
                    shape_index=18,
                    content_key='maintainability_title',
                    description='保守性（Maintainability）- Title',
                ),
                ShapeTarget(
                    shape_name='Google Shape;1015;p103',  # Shape 20 - Maintainability body
                    shape_index=19,
                    content_key='maintainability_body',
                    description='保守性（Maintainability）- Body with 5 bullets',
                ),
                ShapeTarget(
                    shape_name='Google Shape;1010;p103',  # Shape 15 - Scalability title
                    shape_index=14,
                    content_key='scalability_title',
                    description='スケーラビリティ（Scalability）- Title',
                ),
                ShapeTarget(
                    shape_name='Google Shape;1011;p103',  # Shape 16 - Scalability body
                    shape_index=15,
                    content_key='scalability_body',
                    description='スケーラビリティ（Scalability）- Body with 5 bullets',
                ),
                ShapeTarget(
                    shape_name='Google Shape;1006;p103',  # Shape 11 - Availability title
                    shape_index=10,
                    content_key='availability_title',
                    description='可用性（Availability）- Title',
                ),
                ShapeTarget(
                    shape_name='Google Shape;1007;p103',  # Shape 12 - Availability body
                    shape_index=11,
                    content_key='availability_body',
                    description='可用性（Availability）- Body with 5 bullets',
                ),
            ],
            description='Non-Functional Requirements - Proposed NFRs based on infrastructure and tech stack',
            notes="""
            Slide 35 fills 4 sections with non-functional requirements when customer doesn't specify them in RFP.
            Based on proposed infrastructure (AWS ECS/ALB/Aurora) and tech stack (Next.js/NestJS/TypeScript).

            Markdown format expected:
            <!-- FILL_SLIDE: 35 -->

            <!-- SHAPE: performance_title -->
            パフォーマンス（Performance）

            <!-- SHAPE: performance_body -->
            ・応答時間：Webページ < 3秒、API < 1秒を目標とする
            ・TTFB：初回バイト到達時間 < 200msを維持する
            ・同時接続数：ピーク時1,000ユーザーに対応可能とする
            ・スループット：100 RPS以上を安定して処理できる構成とする
            ・画面遷移：ページ遷移時の体感速度 < 1秒を実現する

            <!-- SHAPE: maintainability_title -->
            保守性（Maintainability）

            <!-- SHAPE: maintainability_body -->
            ・ログ保持期間：アプリケーションログ30日間、監査ログ90日間以上とする
            ・モニタリング：システム稼働状況を99.5%以上カバーする監視体制を構築する
            ・デプロイ頻度：週1回以上の安全なリリースが可能な体制を整える
            ・平均修復時間（MTTR）：障害検知から復旧まで2時間以内を目標とする
            ・ドキュメント整備：運用手順書・障害対応手順を整備し、属人化を排除する

            <!-- SHAPE: scalability_title -->
            スケーラビリティ（Scalability）

            <!-- SHAPE: scalability_body -->
            ・オートスケール条件：CPU使用率70%超過またはメモリ80%超過時に自動拡張する
            ・スケールアウト時間：5分以内に2～10インスタンスへ拡張可能とする
            ・データベース容量：初期100GB、必要に応じて1TBまで拡張可能な設計とする
            ・ストレージ拡張性：S3ベースで無制限拡張可能な構成とする
            ・負荷分散：ALBにより複数インスタンスへ均等に負荷分散を行う

            <!-- SHAPE: availability_title -->
            可用性（Availability）

            <!-- SHAPE: availability_body -->
            ・稼働率：99.9%以上（年間ダウンタイム8.77時間以内）を目標とする
            ・RTO（復旧目標時間）：障害発生から4時間以内にサービス復旧する
            ・RPO（復旧目標地点）：データ損失を1時間以内に抑える
            ・バックアップ頻度：データベースは日次バックアップ＋7日間保持とする
            ・マルチAZ構成：2つ以上のAZに配置し、単一障害点を排除する

            Requirements:
            - Written in formal Japanese (proposal tone)
            - Exactly 4 sections in order: Performance, Maintainability, Scalability, Availability
            - Each section has exactly 5 bullets using ・ (middle dot)
            - Each bullet is one concise line with quantitative metrics when applicable
            - Metrics: 秒/ms/% for time, RPS for throughput, 人数 for users, 時間/分 for duration
            - Don't describe implementation details ("we will use X to achieve Y")
            - Only write expected SLO/targets the system will meet
            - Use realistic values for enterprise web/app systems (not exaggerated)
            - No line breaks within bullets (each bullet is one line)

            Context: Customer didn't provide NFRs in RFP, so we propose reasonable targets based on:
            - Infrastructure: AWS ECS, ALB, Aurora, CloudWatch, Multi-AZ
            - Tech Stack: Next.js/NestJS/TypeScript, Terraform IaC, GitHub CI/CD
            - System Scale: Medium enterprise application with moderate traffic

            Shape Mapping:
            - Performance: Shape 6 (title) + Shape 7 (body) - top-left quadrant
            - Maintainability: Shape 19 (title) + Shape 20 (body) - top-right quadrant
            - Scalability: Shape 15 (title) + Shape 16 (body) - bottom-left quadrant
            - Availability: Shape 11 (title) + Shape 12 (body) - bottom-right quadrant
            """,
        )

        # Slide 36: Detailed Non-Functional Requirements Table (非機能要件・詳細版)
        self.slide_configs[36] = SlideConfig(
            slide_number=36,
            layout_type='detailed_nfr_table',
            content_types=['table'],
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;1023;p104',  # Shape 1 - TABLE
                    shape_index=0,
                    content_key='detailed_nfr_table',
                    description='非機能要件詳細版 - Detailed NFR table for technical evaluation',
                ),
            ],
            description='Detailed Non-Functional Requirements - Comprehensive technical NFR table for CTO/Tech Lead review',
            notes="""
            Shape 1 (index 0): Fill with 'detailed_nfr_table' - Detailed non-functional requirements table

            This slide is for deep technical evaluation (CTO / Tech Lead level).
            Use when customer prioritizes NFRs (banking, payment, insurance, large-scale systems).
            Or for technical proposal review / competitive bidding.

            Markdown format expected:
            <!-- FILL_SLIDE: 36 -->

            <!-- SHAPE: detailed_nfr_table -->
            | # | カテゴリ | 項目 | 要求レベル／目標値 | 技術的補足（設計・運用観点） |
            |---|---------|------|-------------------|---------------------------|
            | 1 | パフォーマンス | Web応答時間 | P95 < 3秒 | CDN・キャッシュ前提、ピーク時もSLO維持可能な構成 |
            | 2 | パフォーマンス | APIレイテンシ | P95 < 600ms | 非同期処理・コネクションプール最適化 |
            | 3 | パフォーマンス | TTFB | P95 < 200ms | エッジキャッシュ・CDN活用によるレイテンシ削減 |
            | 4 | 可用性 | 稼働率 | 99.9%以上 | マルチAZ構成、単一障害点の排除 |
            | 5 | 可用性 | RTO（復旧目標時間） | < 4時間 | 自動復旧メカニズム＋Runbook整備 |
            | 6 | 可用性 | RPO（復旧目標地点） | < 1時間 | 継続的バックアップ＋Point-in-Time Recovery |
            | 7 | 信頼性 | データ耐久性 | 99.999999999% | マネージドDB（Aurora/RDS）＋自動バックアップ |
            | 8 | 信頼性 | エラー率 | < 0.1% | リトライ・サーキットブレーカーパターン実装 |
            | 9 | スケーラビリティ | 同時接続数 | 100,000ユーザー | 水平スケール前提、事前負荷試験で検証 |
            | 10 | スケーラビリティ | オートスケール時間 | < 5分 | ECS/EKSオートスケール＋ウォームプール活用 |
            | 11 | セキュリティ | データ暗号化 | 保存時・通信時ともに暗号化 | AES-256（保存時） / TLS1.2以上（通信時） |
            | 12 | セキュリティ | 認証・認可 | 2FA / RBAC | 多要素認証＋ロールベースアクセス制御、監査証跡確保 |
            | 13 | セキュリティ | 脆弱性対応 | Critical: 24時間以内 | 自動スキャン＋パッチ適用プロセス確立 |
            | 14 | 運用・監視 | 障害検知時間 | < 5分 | CloudWatch/Datadog等でメトリクス監視＋アラート |
            | 15 | 運用・監視 | ログ保持期間 | アプリ30日、監査90日 | S3ライフサイクル管理＋Glacier移行 |
            | 16 | 保守性 | コード品質 | テストカバレッジ > 80% | CI/CDパイプラインで品質ゲート設定 |
            | 17 | 保守性 | デプロイ頻度 | 週1回以上 | ブルー・グリーンデプロイ＋ロールバック体制 |
            | 18 | 保守性 | MTTR（平均修復時間） | < 2時間 | 障害対応手順書整備＋オンコール体制 |

            Table structure:
            - 5 columns:
              1. # (Number)
              2. カテゴリ (Category)
              3. 項目 (Item)
              4. 要求レベル／目標値 (Requirement Level / Target Value)
              5. 技術的補足（設計・運用観点） (Technical Supplement - Design/Operations Perspective)
            - 12-18 rows covering detailed NFR specifications
            - 100% Japanese (technical & formal tone)
            - Each row must have:
              * Clear quantitative metrics (SLO/SLA/threshold)
              * Brief technical explanation (why feasible, how to control)
              * NO business function descriptions

            Required categories to cover:
            1. パフォーマンス (Performance)
            2. 可用性・信頼性 (Availability & Reliability)
            3. スケーラビリティ (Scalability)
            4. セキュリティ (Security)
            5. 運用・監視 (Operations & Monitoring)
            6. 保守性・品質 (Maintainability & Quality)

            Context:
            - Customer has identified NFRs as critical (banking, payment, insurance, large-scale systems)
            - Or used in competitive bidding / technical proposal review
            - Based on modern cloud infrastructure + tech stack (AWS, containers, IaC, monitoring, CI/CD)
            - For deep technical evaluation by CTO / Tech Lead

            Key differences from Slide 35:
            - Slide 35: Overview level (4 sections with bullets) - for business stakeholders
            - Slide 36: Detailed level (comprehensive table) - for technical stakeholders

            Metrics examples:
            - Response time: P95 < 3秒 (not just "fast")
            - Availability: 99.9% (not just "high availability")
            - Scale: 100,000 concurrent users (not just "scalable")
            - Security: AES-256 / TLS1.2+ (not just "secure")
            - MTTR: < 2時間 (not just "quick recovery")

            Technical supplement should explain:
            - HOW it's achieved technically (CDN, caching, multi-AZ, etc.)
            - WHY it's feasible (managed services, automation, etc.)
            - HOW to control/verify (testing, monitoring, etc.)

            Write in formal technical Japanese suitable for:
            - System architecture review
            - Technical RFP response
            - SLA/SLO documentation
            - CTO-level technical evaluation
            """,
        )

        # SLIDE 43: システム開発スケジュール (System Development Schedule)
        # Layout: Blank Slide (16 shapes)
        # Structure:
        #   - Shape 14 (GROUP): Header with title "システム開発スケジュール" + subtitle
        #   - Shape 0: Google Shape;1161;p111  AUTO_SHAPE - description text (22.999 × 1.541 cm)
        #   - Shape 15: Google Shape;443;p 1   AUTO_SHAPE - large empty rectangle (24.13 × 8.809 cm)
        #   - Shapes 1-4: Legend labels (Sun*, 貴社, 次フェーズ, その他)
        #   - Shapes 5-13: Task detail boxes at bottom
        #
        # To embed a Gantt chart PNG, supply 'schedule_image' as:
        #   - base64 data URI: data:image/png;base64,...  (recommended for remote use)
        #   - local file path: /path/to/image.png         (local only)
        #
        # Also supply 'schedule_description' as plain text for the description area.
        self.slide_configs[43] = SlideConfig(
            slide_number=43,
            layout_type='image_with_text',
            content_types=['text', 'image'],
            placeholder_count=1,
            has_title=True,
            shape_targets=[
                ShapeTarget(
                    shape_name='Google Shape;1161;p111',  # Shape 0 - Description text
                    shape_index=0,  # 0-based index
                    content_key='schedule_description',
                    description='スケジュール説明 - Schedule description text (3 lines)',
                ),
                ShapeTarget(
                    shape_name='Google Shape;443;p 1',  # Shape 15 - Large empty area for Gantt image
                    shape_index=15,  # 0-based index
                    content_key='schedule_image',
                    description='開発スケジュール画像 — Development schedule Gantt chart image (base64 data URI or file path)',
                ),
            ],
            description='Slide 43: システム開発スケジュール — Development schedule with Gantt chart image and description',
            notes="""
            Shape 0 (index 0): Fill with 'schedule_description' — plain text description of the schedule
            Shape 15 (index 15): Fill with 'schedule_image' — base64 data URI or file path to Gantt chart PNG

            Markdown format:
            <!-- FILL_SLIDE: 43 -->

            <!-- SHAPE: schedule_description -->
            8月からの支援を開始する前提で、7月中に貴社にて要件整理と要件定義を進めていただく想定です。
            支援初月はインプットおよびスプリント開始に必要な準備が必要となります。
            10月からスプリントを回しながら、毎月リリースを実施し、来年度からのシステム移行開始を目指します。

            <!-- SHAPE: schedule_image -->
            data:image/png;base64,iVBORw0KGgo...

            Image placeholder: left=0.635cm, top=4.445cm, width=24.13cm, height=8.809cm
            The Gantt chart image is overlaid on the large AUTO_SHAPE placeholder.

            Content guidelines for schedule_description:
              - 2-3 lines describing the schedule overview
              - Mention key milestones and timing
              - Written in formal Japanese (proposal tone)
              - Max 80 words total

            The Gantt chart image should be generated using Mermaid gantt syntax:
            - Color by responsible party: Red=Sun*, Blue=貴社, Gray=その他, Default=次フェーズ
            - Keep sections simple: max 3-4 tasks per section
            - Include milestones with 0d duration
            - White background, suitable for presentation
            """,
        )

    def _fill_table_slide(self, slide, slide_content):
        """Custom handler for slides with existing tables"""
        # logger.info(f'Custom handler: Filling table in slide {slide_content.slide_number}')
        pass

    def get_template_info(self):
        """Get template information"""
        return {
            'name': 'SVN Proposal Menu',
            'total_slides': 71,
            'configured_slides': len(self.slide_configs),
            'protected_slides': self.protected_slides,
            'version': '1.0.0',
            'last_updated': '2025-12-23',
        }


# Example usage and testing
if __name__ == '__main__':
    template = SVNProposalTemplate()

    print('=== SVN Proposal Template Config ===')
    print(f'Total configured slides: {len(template.slide_configs)}')
    print(f'Protected slides: {template.protected_slides}')
    print()

    # Test slide 4 config
    slide4_config = template.get_slide_config(4)
    if slide4_config:
        print('Slide 4 Config:')
        print(f'  Layout: {slide4_config.layout_type}')
        print(f'  Shape Targets: {len(slide4_config.shape_targets or [])}')
        for target in (slide4_config.shape_targets or []):
            print(f'    - {target.content_key}: {target.description}')
        print()
