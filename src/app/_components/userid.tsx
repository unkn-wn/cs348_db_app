"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";


export function UserID() {

  const [userID, setUserID] = useState<number | null>(null);
  const getUserID = api.account.getUserID.useQuery();

  useEffect(() => {
    if (getUserID.data !== undefined) {
      setUserID(getUserID.data.data);
    }
  }, [getUserID.data]);

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">My Recipes - User: {userID}</h1>
    </>
  );
}