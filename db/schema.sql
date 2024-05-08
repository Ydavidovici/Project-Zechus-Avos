-- Drops existing tables if they exist to allow re-running this script cleanly
DROP TABLE IF EXISTS Sponsorships;
DROP TABLE IF EXISTS Seforim;
DROP TABLE IF EXISTS Admins;

-- Create table for storing Seforim
CREATE TABLE Seforim (
SeferID INTEGER PRIMARY KEY,
SeferName TEXT NOT NULL
);

-- Create table for storing Sponsorships
CREATE TABLE Sponsorships (
SponsorshipID INTEGER PRIMARY KEY,
SeferID INTEGER NOT NULL,
Type TEXT CHECK(Type IN ('Mitzvah', 'Parshah')) NOT NULL,
TypeDetail TEXT NOT NULL,
Amount INTEGER NOT NULL,
SponsorName TEXT,
SponsorContact TEXT,
IsSponsored BOOLEAN NOT NULL,
ForWhom TEXT,
PaymentStatus TEXT CHECK(PaymentStatus IN ('Paid', 'Pledged')) NOT NULL,
PaymentIntentID TEXT,
FOREIGN KEY(SeferID) REFERENCES Seforim(SeferID)
);

CREATE TABLE Admins (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE NOT NULL,
password TEXT NOT NULL
);




/*
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
*/