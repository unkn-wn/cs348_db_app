"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

export function CreateAccount() {
  const utils = api.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const createUser = api.account.create.useMutation({
    onSuccess: async () => {
      await utils.account.invalidate();
      setUsername("");
      setPassword("");
    },
  });

  return (
    <div className="flex flex-col gap-2 min-w-full max-w-xs">
      <h2 className="text-xl font-bold">Create Account</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createUser.mutate({ username, password });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <input
          type="text"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <button
          type="submit"
          className="rounded-full bg-white border border-gray-800 px-10 py-3 font-semibold transition hover:bg-gray-800 hover:text-white"
          disabled={createUser.isPending} // Change to isLoading
        >
          {createUser.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export function AccountList() {
  const utils = api.useUtils();
  const { data: entries, isLoading } = api.account.getAll.useQuery();
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [curUser, setCurUser] = useState<number | null>(null);

  const deleteAccount = api.account.delete.useMutation({
    onSuccess: async () => {
      await utils.account.invalidate();
      setSelectedAccountId(null);
    },
  });

  const { data: userIDData } = api.account.getUserID.useQuery();
  const setUserID = api.account.setUserID.useMutation({
    onSuccess: async () => {
      await utils.account.invalidate();
    },
  });

  useEffect(() => {
    if (userIDData?.data) {
      setCurUser(userIDData.data);
    }
  }, [userIDData]);

  if (isLoading) return <div>Fetching all entries...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-4 text-left">ID</th>
            <th className="p-4 text-left">Username</th>
            <th className="p-4 text-left">Password</th>
          </tr>
        </thead>
        <tbody>
          {entries?.map((account) => (
            <tr key={account.id} className="border-b">
              <td className="p-4">{account.id}</td>
              <td className="p-4">{account.username}</td>
              <td className="p-4">{account.password}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex flex-row min-w-full gap-2">
        <div className="w-1/2 flex flex-col gap-2">
          <h2 className="text-xl font-bold">Delete Account</h2>
          <select
            value={selectedAccountId ?? ""}
            onChange={(e) => setSelectedAccountId(Number(e.target.value))}
            className="w-full rounded-full px-4 py-2 text-black"
          >
            <option value="" disabled>Select account</option>
            {entries?.map((account) => (
              <option key={account.id} value={account.id}>
                {account.username}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (selectedAccountId !== null) {
                deleteAccount.mutate({ id: selectedAccountId });
              }
            }}
            className="mt-2 rounded-full bg-red-500 px-10 py-3 font-semibold text-white transition hover:bg-red-700"
            disabled={deleteAccount.isPending || selectedAccountId === null}
          >
            {deleteAccount.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>

        <div className="w-1/2 flex flex-col gap-2">
          <h2 className="text-xl font-bold">Select Current User</h2>
          <select
            value={curUser ?? ""}
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              setCurUser(selectedId);
              setUserID.mutate({ userID: selectedId });
              alert("Changed to " + selectedId);
            }}
            className="w-full rounded-full px-4 py-2 text-black"
          >
            <option value="" disabled>Select user</option>
            {entries?.map((account) => (
              <option key={account.id} value={account.id}>
                {account.username}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}