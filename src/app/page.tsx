import Landing from "@/sections/Landing";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  return <Landing session={session} />;
}
