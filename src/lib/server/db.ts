import { env } from "$env/dynamic/private";
import postgres from "postgres";

const sql = postgres({
    database: "cpsc391_tttop_db",
    host: "cps-postgresql.gonzaga.edu",
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PW,
});

export default sql;
