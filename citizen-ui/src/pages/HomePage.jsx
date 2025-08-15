import { Link } from "react-router-dom";
import PrimaryNavBar from "../components/PrimaryNavBar";

const Home = () => {
  return (
    <div className="relative flex h-screen flex-col bg-gradient-to-t from-[#3A66A3] from-4% via-[#9DB2D1] via-72% to-[#FFFFFF] to-100%">
      {/* Main content container with padding bottom for nav bar */}
      <div className="flex-1 overflow-y-auto pb-20"> {/* Added pb-20 to prevent content from being hidden behind nav */}
        <h1 className="mt-6 mb-6 text-4xl font-extrabold text-left">Home</h1>

        <div className="mt-6 mb-6 grid grid-cols-2 gap-4 px-4"> {/* Added px-4 for side padding */}
          {/* Travel Warrant Button */}
          <Link
            to="/travel-warrant"
            className="cursor-pointer rounded-xl border border-white/30 bg-white/20 p-4 text-center shadow-lg backdrop-blur-md transition duration-300 hover:bg-white/30"
          >
            <div className="mb-2 flex items-start justify-center">
              <img 
                src="../png/travelWarrent.png" 
                alt="travelWarrent1" 
                className="w-12 h-12" // Added fixed size for mobile
              />
            </div>
            <p className="text-lg font-medium md:text-xl">Request a Travel Warrant</p> {/* Adjusted text size */}
          </Link>

          {/* Salary Particular Button */}
          <Link
            to="/salary-particular"
            className="cursor-pointer rounded-xl border border-white/30 bg-white/20 p-4 text-center shadow-lg backdrop-blur-md transition duration-300 hover:bg-white/30"
          >
            <div className="mb-2 flex items-start justify-center">
              <img 
                src="../png/salaryPraticular.png" 
                alt="Salary Particular" 
                className="w-12 h-12" // Added fixed size for mobile
              />
            </div>
            <p className="text-lg font-medium md:text-xl"> {/* Adjusted text size */}
              Request a Salary Particular Confirmation
            </p>
          </Link>
        </div>

        <h2 className="mb-5 text-xl font-bold px-4">Recent</h2> {/* Added px-4 */}
        <div className="mx-4 mb-6 flex items-center justify-between rounded-xl border border-white/30 bg-white/20 p-4 backdrop-blur-md"> {/* Added mx-4 and mb-6 */}
          <div className="flex items-center gap-3">
            <div>
              <img 
                src="../png/travelWarrent2.png" 
                alt="Travel Warrent 2" 
                className="w-10 h-10" // Added fixed size for mobile
              />
            </div>
            <div>
              <p className="text-sm font-bold">Travel Warrant</p>
              <p className="text-xs text-black">03.04.2025</p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-sm font-semibold text-black hover:underline">
            Track →
          </button>
        </div>
      </div>

      {/* Nav bar positioned at the bottom */}
      <div className="fixed bottom-0 left-0 right-0">
        <PrimaryNavBar />
      </div>
    </div>
  );
};

export default Home;