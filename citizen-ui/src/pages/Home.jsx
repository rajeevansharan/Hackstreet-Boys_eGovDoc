import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1 className="mt-25 mb-6 ml-5 text-4xl font-extrabold">Home</h1>

      <div className="mt-6 mb-11 grid grid-cols-2 gap-4">
        {/* Travel Warrant Button */}
        <Link
          to="/travel-warrant" // Change route as needed
          className="cursor-pointer rounded-xl border border-white/30 bg-white/20 p-4 text-center shadow-lg backdrop-blur-md transition duration-300 hover:bg-white/30"
        >
          <div className="mb-2 flex items-start justify-center">
            <img src="../png/travelWarrent.png" alt="travelWarrent1" />
          </div>
          <p className="text-xl font-medium">Request a Travel Warrant</p>
        </Link>

        {/* Salary Particular Button */}
        <Link
          to="/salary-particular" // Change route as needed
          className="cursor-pointer rounded-xl border border-white/30 bg-white/20 p-4 text-center shadow-lg backdrop-blur-md transition duration-300 hover:bg-white/30"
        >
          <div className="mb-2 flex items-start justify-center">
            <img src="../png/salaryPraticular.png" alt="Salary Particular" />
          </div>
          <p className="text-xl font-medium">
            Request a Salary Particular Confirmation
          </p>
        </Link>
      </div>

      <h2 className="mb-5 ml-5 text-xl font-bold">Recent</h2>
      <div className="flex items-center justify-between rounded-xl border border-white/30 bg-white/20 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div>
            <img src="../png/travelWarrent2.png" alt="Travel Warrent 2" />
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
  );
};

export default Home;
