import { useState } from "react";
import SecondaryNavBar from "../components/SecondaryNavBar";
import RequestList from "../components/RequestList";

const TABS = ["All", "Completed", "Pending", "Rejected"];

const RequestPage = ({ serviceId, userId }) => {
  const [active, setActive] = useState(0);

  return (
    <div className="px-4">
      <h1 className="mt-6 mb-6 text-left text-4xl font-extrabold">Requests</h1>

      <SecondaryNavBar
        value={active}
        onChange={setActive}
        items={TABS.map((label) => ({ label }))}
      />

      <RequestList
        serviceId={serviceId ?? "service001"}
        userId={userId ?? "u003"}
        activeLabel={TABS[active]}
      />
    </div>
  );
};

export default RequestPage;