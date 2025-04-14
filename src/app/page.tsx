import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) {
    redirect("/chat");
  }

  return (
    <div>
      <h1>Welcome to NextChat Kids!</h1>
      <p>Please sign in to start chatting.</p>
    </div>
  );
}
