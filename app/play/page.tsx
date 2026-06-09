import { Header } from "@/components/Header";
import { Game } from "@/components/game/Game";

export const metadata = { title: "KAINOVA — Play" };

export default function PlayPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        <Game />
      </main>
    </>
  );
}
