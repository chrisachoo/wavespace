# SQL Scripts Run Order

For a **fresh database**, run in this order (use 0 when resetting the DB):

| Order | Script | Purpose |
|-------|--------|---------|
| 0 | `000_drop_all_tables.sql` | Drops RPCs and all tables. |
| 1 | `001_create_schema.sql` | Tables, RLS, policies, realtime, indexes. Question `time_limit` default: **40** seconds. |
| 2 | `005_submit_answer_rpc.sql` | `submit_answer()` RPC for atomic scoring. |
| 3 | `006_join_quiz_rpc.sql` | `join_quiz()` RPC with 70-participant cap. |
| 4 | `002_seed_stack_quiz.sql` | Optional: "Know Your Stack" seed quiz. |
| 5 | `003_seed_general_knowledge_quiz.sql` | Optional: "General Knowledge" seed quiz. |

**Skip** `004_allow_delete_participants_answers.sql` when you run `001` on a clean DB; `001` already includes the delete policies. Use `004` only if you have an older DB that was created before those policies existed.


bun run db:seed scripts/000_drop_all_tables.sql
bun run db:seed scripts/001_create_schema.sql
bun run db:seed scripts/005_submit_answer_rpc.sql
bun run db:seed scripts/006_join_quiz_rpc.sql
bun run db:seed scripts/002_seed_stack_quiz.sql
bun run db:seed scripts/003_seed_general_knowledge_quiz.sql
bun run db:seed scripts/007_townhall_takeover.sql