import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";

test.group("courts", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });
});
