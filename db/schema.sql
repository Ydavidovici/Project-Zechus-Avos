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
Type TEXT CHECK(Type IN ('Mitzvah', 'Parshah', 'Cover')) NOT NULL,
TypeDetail TEXT NOT NULL,
Amount INTEGER NOT NULL,
SponsorName TEXT,
SponsorContact TEXT,
IsSponsored BOOLEAN NOT NULL,
ForWhom TEXT,
PaymentStatus TEXT CHECK(PaymentStatus IN ('Paid', 'Unpaid')) NOT NULL,
PaymentIntentID TEXT,
FOREIGN KEY(SeferID) REFERENCES Seforim(SeferID)
);

CREATE TABLE Admins (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE NOT NULL,
password TEXT NOT NULL
);




BEGIN TRANSACTION;

-- Inserting Mitzvah sponsorships for 'Mekor Habracha'
INSERT INTO Sponsorships (SeferID, Type, TypeDetail, Amount, IsSponsored, PaymentStatus) VALUES
                                                                                             (1, 'Mitzvah', 'פריה ורביה', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'מילה', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'גיד הנשה', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'קידוש החודש', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'הקרבת קרבן פסח', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'אכילת הפסח', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'לא תעשה נא ומבושל', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא להוסיר מהפסח', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'עשה השבתת חמץ', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'אכילת מצה', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא ימצא חמץ ברשותנו בפסח', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'תערובות חמץ', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא להאכיל מן הפסח ישראל מומר', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא להאכיל מן הפסח לגר ותושב', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא להוציא מבשר הפסח', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא לשבר עצם מן הפסח', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא יאכל ערל מן הפסח', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'קידוש בכורות בארץ ישראל', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא יאכל חמץ בפסח', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא יראה חמץ בפסח', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'סיפור יציאת מצרים', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'פדיון ועריפת פטר חמור', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא לילך חוץ מתחום שבת', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'האמונה במציאות ה', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא להאמין באלוה זולתו', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא לעשות צלמים', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא להשתחוות לעבודה זרה', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא נעבוד שום עבודה אחרת', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא לשבוע לשוא', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'זכור את יום השבת', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא לעשות מלאכה בשבת', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'כבוד אב ואם', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'לא תרצח', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא לגלות ערות אשת איש', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא לגנוב נפש מישראל', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא להעיד עדות שקר', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'לא תחמוד', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא לעשות צורת אדם', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא לבנות אבני מזבח גזית', 240000, 0, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'שלא לפסוע על המזבח', 240000, 0, 'Unpaid');

-- Inserting cover sponsorships for 'Mekor Habracha' and 'Siach Eliezer'
INSERT INTO Sponsorships (SeferID, Type, TypeDetail, Amount, IsSponsored, PaymentStatus) VALUES
                                                                                             (1, 'Cover', 'Book Cover', 1800000, 0, 'Unpaid'),
                                                                                             (2, 'Cover', 'Book Cover', 500000, 0, 'Unpaid');

-- Inserting Parshah sponsorships for 'Siach Eliezer'
INSERT INTO Sponsorships (SeferID, Type, TypeDetail, Amount, IsSponsored, PaymentStatus) VALUES
                                                                                             (2, 'Parshah', 'Bereishis', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Noach', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Lech-Lecha', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayeira', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Chayei Sarah', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Toldos', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayetze', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayishlach', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayeishev', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Mikeitz', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayigash', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayechi', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Shemos', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vaera', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Bo', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Beshalach', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Yisro', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Mishpatim', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Terumah', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Tetzaveh', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Ki Tisa', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayakhel', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Pekudei', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayikra', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Tzav', 240000, 0, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Shemini', 240000, 0, 'Unpaid');

COMMIT;