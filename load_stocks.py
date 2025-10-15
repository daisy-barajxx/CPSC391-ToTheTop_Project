# EXPERIMENTAL, DO NOT USE


import json
import getpass
import psycopg2
from psycopg2.extras import execute_batch


def stocks_to_db(password: str):
    conn = psycopg2.connect(
        f"dbname=cpsc391_tttop_db user=dlewis5 password={password} host=cps-postgresql.gonzaga.edu")

    cur = conn.cursor()

    with open("/home/damon/Downloads/company_tickers.json") as f:
        data = json.load(f)
        vals = [(item["ticker"], item["title"]) for item in data.values()]

        execute_batch(cur, "INSERT INTO stocks VALUES (%s, %s)", vals)

    conn.commit()
    conn.close()


if __name__ == "__main__":
    stocks_to_db(getpass.getpass())
