import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <div className="flex-1 overflow-y-auto pb-20">
        <h1 className="mt-6 mb-6 text-left text-4xl font-extrabold">Home</h1>
        <div className="mt-6 mb-6 grid grid-cols-2 gap-4 px-4">
          <Link
            to="/travel-warrant"
            className="cursor-pointer rounded-xl border border-white/30 bg-white/20 p-4 text-center shadow-lg backdrop-blur-md transition duration-300 hover:bg-white/30"
          >
            <div className="mb-2 flex items-start justify-center">
              <img
                src="../png/travelWarrent.png"
                alt="travelWarrent1"
                className="h-12 w-12"
              />
            </div>
            <p className="text-lg font-medium md:text-xl">
              Request a Travel Warrant
            </p>
          </Link>

          <Link
            to="/salary-particular"
            className="cursor-pointer rounded-xl border border-white/30 bg-white/20 p-4 text-center shadow-lg backdrop-blur-md transition duration-300 hover:bg-white/30"
          >
            <div className="mb-2 flex items-start justify-center">
              <img
                src="../png/salaryPraticular.png"
                alt="Salary Particular"
                className="h-12 w-12"
              />
            </div>
            <p className="text-lg font-medium md:text-xl">
              Request a Salary Particular Confirmation
            </p>
          </Link>
        </div>
        <h2 className="mb-5 px-4 text-xl font-bold">Recent</h2>{" "}
        <div className="mx-4 mb-6 flex items-center justify-between rounded-xl border border-white/30 bg-white/20 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div>
              <img
                src="../png/travelWarrent2.png"
                alt="Travel Warrent 2"
                className="h-10 w-10"
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
    </div>
  );
};

export default Home;
