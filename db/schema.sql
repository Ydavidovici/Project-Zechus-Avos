-- Drops existing tables if they exist to allow re-running this script cleanly
DROP TABLE IF EXISTS Sponsorships CASCADE;
DROP TABLE IF EXISTS Seforim CASCADE;
DROP TABLE IF EXISTS Admins CASCADE;

-- Create table for storing Seforim
CREATE TABLE Seforim (
                         SeferID SERIAL PRIMARY KEY,
                         SeferName TEXT NOT NULL
);

-- Create table for storing Sponsorships
CREATE TABLE Sponsorships (
                              SponsorshipID SERIAL PRIMARY KEY,
                              SeferID INTEGER NOT NULL,
                              Type TEXT NOT NULL CHECK(Type IN ('Mitzvah', 'Parshah', 'Cover')),
                              TypeDetail TEXT NOT NULL,
                              Amount INTEGER NOT NULL,
                              SponsorName TEXT,
                              SponsorContact TEXT,
                              IsSponsored BOOLEAN NOT NULL,
                              ForWhom TEXT,
                              PaymentStatus TEXT NOT NULL CHECK(PaymentStatus IN ('Paid', 'Unpaid')),
                              PaymentIntentID TEXT,
                              FOREIGN KEY(SeferID) REFERENCES Seforim(SeferID) ON DELETE CASCADE
);

-- Create table for storing Admins
CREATE TABLE Admins (
                        id SERIAL PRIMARY KEY,
                        username TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL
);

-- Begin transaction for data insertion
BEGIN TRANSACTION;

-- Inserting data into Seforim
INSERT INTO Seforim (SeferName) VALUES
                                    ('Mekor Habracha'),
                                    ('Siach Eliezer');

-- Inserting Mitzvah sponsorships for 'Mekor Habracha'
INSERT INTO Sponsorships (SeferID, Type, TypeDetail, Amount, IsSponsored, PaymentStatus) VALUES
                                                                                             (1, 'Mitzvah', 'Pru Urvu', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Milah', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Gid Hanashe', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Kiddush Hachodesh', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Hakravas Korban Pesach', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Achilas Hapesach', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Lo Saaseh Na Umevushal', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Lehossir Mehapessach', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Asseh Hashbasas Chametz', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'AchilaS Matzah', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Yimatzeh Chametz Breshusenu Bapesach', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Ta’aruvos Chametz', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Le’ha’achil Min Hapesach Yisrael Mumar', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Le’ha’achil Min Hapesach L’ger Vetoshav', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Le’hotzi Mib’sar Hapesach', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Leshbor Etzem Min Hapesach', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Ye’khal Areil Min Hapesach', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Kiddush Bechorot Be’Eretz Yisrael', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Ye’khal Chametz Bapesach', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Yireh Chametz Bapesach', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Sippur Yetzias Mitzrayim', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Pidyon Vearifas Petter Chamor', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Laleches Chutz Letchum Shabbat', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Ha’Emunah Bemetzius Hashem', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Leha’amin Be’el Acher', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo La’asos Tzelamim', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Le’hishtachavos Leavodah Zara', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Na’avod Shum Avodah Acheres', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Lishavua Leshav', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Zachor Es Yom Hashabbas', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo La’asos Melachah BeShabbas', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Kibbud Av V’em', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Lo Sirtzach', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Legalos Ervas Eshes Ish', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Lignov Nefesh MiYisrael', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Leha’id Edus Sheker', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Lo Sachmod', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo La’asos Tzuras Adam', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Livnos Avanei Mizbeach Gazit', 240000, FALSE, 'Unpaid'),
                                                                                             (1, 'Mitzvah', 'Shelo Lifso’a Al Hamizbeach', 240000, FALSE, 'Unpaid');

-- Inserting Cover sponsorships for 'Mekor Habracha' and 'Siach Eliezer'
INSERT INTO Sponsorships (SeferID, Type, TypeDetail, Amount, IsSponsored, PaymentStatus) VALUES
                                                                                             (1, 'Cover', 'Sefer Cover', 2600000, FALSE, 'Unpaid'),
                                                                                             (2, 'Cover', 'Sefer Cover', 500000, FALSE, 'Unpaid');

-- Inserting Parshah sponsorships for 'Siach Eliezer'
INSERT INTO Sponsorships (SeferID, Type, TypeDetail, Amount, IsSponsored, PaymentStatus) VALUES
                                                                                             (2, 'Parshah', 'Bereishis', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Noach', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Lech-Lecha', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayeira', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Chayei Sarah', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Toldos', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayetze', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayishlach', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayeishev', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Mikeitz', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayigash', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayechi', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Shemos', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vaera', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Bo', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Beshalach', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Yisro', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Mishpatim', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Terumah', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Tetzaveh', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Ki Sisa', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayakhel', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Pekudei', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Vayikra', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Tzav', 240000, FALSE, 'Unpaid'),
                                                                                             (2, 'Parshah', 'Shemini', 240000, FALSE, 'Unpaid');
-- Inserting admin credentials
INSERT INTO Admins (username, password) VALUES
    ('admin1', '$2a$10$rUsjFci3NBsNyDX3ElunD.yA8dVvJ.rGKB2M.bZq4be7dfOm.aure');
COMMIT;
