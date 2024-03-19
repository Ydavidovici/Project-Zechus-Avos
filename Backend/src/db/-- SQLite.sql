-- SQLite
SELECT * FROM mitzvot ORDER BY id ASC;
ALTER TABLE mitzvot ADD order_index INTEGER;
SELECT * FROM mitzvot WHERE sponsored = 0 ORDER BY order_index ASC;

UPDATE mitzvot SET order_index = 1 WHERE id = 1;
UPDATE mitzvot SET order_index = 2 WHERE id = 41;  -- Mitzvah 2
UPDATE mitzvot SET order_index = 3 WHERE id = 42;  -- Mitzvah 3
UPDATE mitzvot SET order_index = 4 WHERE id = 40;  -- Mitzvah 4
UPDATE mitzvot SET order_index = 5 WHERE id = 2;   -- Mitzvah 5
UPDATE mitzvot SET order_index = 6 WHERE id = 3;   -- Mitzvah 6
UPDATE mitzvot SET order_index = 7 WHERE id = 4;   -- Mitzvah 7
UPDATE mitzvot SET order_index = 8 WHERE id = 5;   -- Mitzvah 8
UPDATE mitzvot SET order_index = 9 WHERE id = 6;   -- Mitzvah 9
UPDATE mitzvot SET order_index = 10 WHERE id = 7;  -- Mitzvah 10
UPDATE mitzvot SET order_index = 11 WHERE id = 8;  -- Mitzvah 11
UPDATE mitzvot SET order_index = 12 WHERE id = 9;  -- Mitzvah 12
UPDATE mitzvot SET order_index = 13 WHERE id = 10; -- Mitzvah 13
UPDATE mitzvot SET order_index = 14 WHERE id = 11; -- Mitzvah 14
UPDATE mitzvot SET order_index = 15 WHERE id = 12; -- Mitzvah 15
UPDATE mitzvot SET order_index = 16 WHERE id = 13; -- Mitzvah 16
UPDATE mitzvot SET order_index = 17 WHERE id = 14; -- Mitzvah 17
UPDATE mitzvot SET order_index = 18 WHERE id = 15; -- Mitzvah 18
UPDATE mitzvot SET order_index = 19 WHERE id = 16; -- Mitzvah 19
UPDATE mitzvot SET order_index = 20 WHERE id = 17; -- Mitzvah 20
UPDATE mitzvot SET order_index = 21 WHERE id = 18; -- Mitzvah 21
UPDATE mitzvot SET order_index = 22 WHERE id = 19; -- Mitzvah 22
UPDATE mitzvot SET order_index = 23 WHERE id = 20; -- Mitzvah 23
UPDATE mitzvot SET order_index = 24 WHERE id = 21; -- Mitzvah 24
UPDATE mitzvot SET order_index = 25 WHERE id = 22; -- Mitzvah 25
UPDATE mitzvot SET order_index = 26 WHERE id = 23; -- Mitzvah 26
UPDATE mitzvot SET order_index = 27 WHERE id = 24; -- Mitzvah 27
UPDATE mitzvot SET order_index = 28 WHERE id = 25; -- Mitzvah 28
UPDATE mitzvot SET order_index = 29 WHERE id = 26; -- Mitzvah 29
UPDATE mitzvot SET order_index = 30 WHERE id = 27; -- Mitzvah 30
UPDATE mitzvot SET order_index = 31 WHERE id = 28; -- Mitzvah 31
UPDATE mitzvot SET order_index = 32 WHERE id = 29; -- Mitzvah 32
UPDATE mitzvot SET order_index = 33 WHERE id = 30; -- Mitzvah 33
UPDATE mitzvot SET order_index = 34 WHERE id = 31; -- Mitzvah 34
UPDATE mitzvot SET order_index = 35 WHERE id = 32; -- Mitzvah 35
UPDATE mitzvot SET order_index = 36 WHERE id = 33; -- Mitzvah 36
UPDATE mitzvot SET order_index = 37 WHERE id = 34; -- Mitzvah 37
UPDATE mitzvot SET order_index = 38 WHERE id = 35; -- Mitzvah 38
UPDATE mitzvot SET order_index = 39 WHERE id = 36; -- Mitzvah 39
UPDATE mitzvot SET order_index = 40 WHERE id = 37; -- Mitzvah 40
UPDATE mitzvot SET order_index = 41 WHERE id = 38; -- Mitzvah 41
UPDATE mitzvot SET order_index = 42 WHERE id = 39; -- Mitzvah 42
