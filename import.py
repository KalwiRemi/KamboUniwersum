#!/usr/bin/env python3

import csv
import sqlite3

NUMBER_OF_COLUMNS = 22

con = sqlite3.connect('./dist/database.sqlite')
cur = con.cursor()

with open('data.csv', 'r') as file:
    params = ", ".join(["?" for _ in range(NUMBER_OF_COLUMNS)])
    query = f'INSERT OR REPLACE INTO videos VALUES ({params})'
    reader = csv.reader(file)
    for row in reader:
        cur.execute(query, row)
        con.commit()
