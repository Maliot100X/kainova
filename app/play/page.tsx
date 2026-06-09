import { Header } from "@/components/Header";
import { TokenGate } from "@/components/TokenGate";
import { Game } from "@/components/game/Game";

export const metadata = {
  title: "KAINOVA — Play",
};

export default function PlayPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        <TokenGate>
          <Game />
        </TokenGate>
      </main>
    </>
  );
}
