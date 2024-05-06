CREATE TABLE IF NOT EXISTS siach_eliezer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,  -- e.g., 'parsha', 'cover', 'dedication'
    name TEXT NOT NULL,  -- e.g., name of the parsha, 'Book Cover', 'Dedications Page'
    sponsored BOOLEAN NOT NULL DEFAULT 0,
    sponsor_name TEXT,  -- Nullable: filled if sponsored
    dedication TEXT     -- Nullable: additional dedication text if applicable
);

CREATE TABLE IF NOT EXISTS mekor_habracha (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,  -- 'mitzvah', 'cover', 'dedication'
    name TEXT NOT NULL,  -- Hebrew names of the mitzvahs
    parshah TEXT,  -- The parshah associated with each mitzvah
    description TEXT NOT NULL DEFAULT '',
    sponsored BOOLEAN NOT NULL DEFAULT 0,
    sponsor_name TEXT,
    dedication TEXT
);

-- Begin transaction for data insertion
BEGIN TRANSACTION;

INSERT INTO mekor_habracha (id, type, name, parshah, description) VALUES
(1, 'mitzvah', 'פריה ורביה', 'בראשית', ''),
(2, 'mitzvah', 'מילה', 'לך לך', ''),
(3, 'mitzvah', 'גיד הנשה', 'וישלח', ''),
(4, 'mitzvah', 'קידוש החודש', 'בא', ''),
(5, 'mitzvah', 'הקרבת קרבן פסח', 'בא', ''),
(6, 'mitzvah', 'אכילת הפסח', 'בא', ''),
(7, 'mitzvah', 'לא תעשה נא ומבושל', 'בא', ''),
(8, 'mitzvah', 'שלא להוסיר מהפסח', 'בא', ''),
(9, 'mitzvah', 'עשה השבתת חמץ', 'בא', ''),
(10, 'mitzvah', 'אכילת מצה', 'בא', ''),
(11, 'mitzvah', 'שלא ימצא חמץ ברשותנו בפסח', 'בא', ''),
(12, 'mitzvah', 'תערובות חמץ', 'בא', ''),
(13, 'mitzvah', 'שלא להאכיל מן הפסח ישראל מומר', 'בא', ''),
(14, 'mitzvah', 'שלא להאכיל מן הפסח לגר ותושב', 'בא', ''),
(15, 'mitzvah', 'שלא להוציא מבשר הפסח', 'בא', ''),
(16, 'mitzvah', 'שלא לשבר עצם מן הפסח', 'בא', ''),
(17, 'mitzvah', 'שלא יאכל ערל מן הפסח', 'בא', ''),
(18, 'mitzvah', 'קידוש בכורות בערב יום טוב', 'בא', ''),
(19, 'mitzvah', 'שלא יאכל חמץ בפסח', 'בא', ''),
(20, 'mitzvah', 'שלא יראה חמץ בפסח', 'בא', ''),
(21, 'mitzvah', 'סיפור יציאת מצרים', 'בא', ''),
(22, 'mitzvah', 'פדיון פטר חמור', 'בא', ''),
(23, 'mitzvah', 'עריפת פטר חמור', 'בא', ''),
(24, 'mitzvah', 'שלא לילך חוץ מתחום שבת', 'בשלח', ''),
(25, 'mitzvah', 'האמונה במציאות ה', 'יתרו', ''),
(26, 'mitzvah', 'שלא להאמין באלוה זולתו', 'יתרו', ''),
(27, 'mitzvah', 'שלא לעשות פסל ומציבה', 'יתרו', ''),
(28, 'mitzvah', 'שלא להשתחוה לפסל ומציבה', 'יתרו', ''),
(29, 'mitzvah', 'שלא לעשות מעשה עבודה זרה', 'יתרו', ''),
(30, 'mitzvah', 'שלא להשתחוה לעבודה זרה', 'יתרו', ''),
(31, 'mitzvah', 'שלא להשתחוה לשמש ולירח', 'יתרו', ''),
(32, 'mitzvah', 'שלא להשתחוה לכוכבים', 'יתרו', ''),
(33, 'mitzvah', 'שלא להשתחוה לכל צורה', 'יתרו', ''),
(34, 'mitzvah', 'שלא להשתחוה לצורת אדם', 'יתרו', ''),
(35, 'mitzvah', 'שלא להשתחוה לצורת בהמה', 'יתרו', ''),
(36, 'mitzvah', 'שלא להשתחוה לצורת עוף', 'יתרו', ''),
(37, 'mitzvah', 'שלא להשתחוה לצורת רמש', 'יתרו', ''),
(38, 'mitzvah', 'שלא להשתחוה לצורת דג', 'יתרו', ''),
(39, 'mitzvah', 'שלא לעשות צורת אדם', 'יתרו', ''),
(40, 'mitzvah', 'שלא לבנות אבני מזבח גזית', 'יתרו', ''),
(41, 'mitzvah', 'שלא לפסוע על המזבח', 'יתרו', ''),
(42, 'mitzvah', 'שלא לעלות במעלות על המזבח', 'יתרו', '');

INSERT INTO mekor_habracha (type, name) VALUES
('cover', 'Book Cover'),
('dedication', 'Dedications Page');

COMMIT;

BEGIN TRANSACTION;

INSERT INTO siach_eliezer (type, name) VALUES
('parsha', 'Bereishis'),
('parsha', 'Noach'),
('parsha', 'Lech-Lecha'),
('parsha', 'Vayeira'),
('parsha', 'Chayei Sarah'),
('parsha', 'Toldos'),
('parsha', 'Vayetze'),
('parsha', 'Vayishlach'),
('parsha', 'Vayeishev'),
('parsha', 'Mikeitz'),
('parsha', 'Vayigash'),
('parsha', 'Vayechi'),
('parsha', 'Shemos'),
('parsha', 'Vaera'),
('parsha', 'Bo'),
('parsha', 'Beshalach'),
('parsha', 'Yitro'),
('parsha', 'Mishpatim'),
('parsha', 'Terumah'),
('parsha', 'Tetzaveh'),
('parsha', 'Ki Tisa'),
('parsha', 'Vayakhel'),
('parsha', 'Pekudei'),
('parsha', 'Vayikra'),
('parsha', 'Tzav'),
('parsha', 'Shemini');

INSERT INTO siach_eliezer (type, name) VALUES
('cover', 'Book Cover'),
('dedication', 'Dedications Page');

COMMIT;
