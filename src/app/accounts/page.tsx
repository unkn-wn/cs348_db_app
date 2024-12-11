import { CreateAccount, AccountList } from "~/app/_components/account";
import { HydrateClient } from "~/trpc/server";

export default async function Events() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col">
        <div className="container flex flex-col gap-12 px-4 py-4">
          <h1 className="text-3xl font-extrabold tracking-tight">Accounts Management</h1>

          <CreateAccount />

          {/* Table for SQL */}
          <AccountList />

        </div>
      </main>
    </HydrateClient>
  );
}
