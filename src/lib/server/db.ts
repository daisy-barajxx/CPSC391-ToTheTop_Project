import { POSTGRES_PW } from "$env/static/private";
import postgres from "postgres";

const sql = postgres({
    database: "cpsc391_tttop_db",
    host: "cps-postgresql.gonzaga.edu",
    user: "dlewis5",
    password: POSTGRES_PW,
});

export default sql;
