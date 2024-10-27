import Link from "next/link";

// import { LatestPost, AllPosts } from "~/app/_components/post";
import { api, HydrateClient } from "~/trpc/server";

export default async function Events() {
  const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Hello World2
          </h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>
          </div>

          {/* <LatestPost />

          <AllPosts /> */}
        </div>
      </main>
    </HydrateClient>
  );
}
