import HomePage from "./HomePage";
import PrimaryNavBar from "../components/PrimaryNavBar";

export default function Home() {
  return (
    <div className="relative flex h-screen flex-col bg-gradient-to-t from-[#3A66A3] from-4% via-[#9DB2D1] via-72% to-[#FFFFFF] to-100%">
      <HomePage />
      <PrimaryNavBar />
    </div>
  );
}
