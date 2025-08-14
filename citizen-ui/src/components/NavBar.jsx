import notifications from "../assets/bell.svg";
import home from "../assets/house-door.svg";
import requests from "../assets/list-task.svg";
import user from "../assets/person.svg";

function NavBar() {
  return (
    <div className="glassy-card flex w-full justify-between">
      <img width="25px" height="25px" src={home} />
      <img width="25px" height="25px" src={requests} />
      <img width="25px" height="25px" src={notifications} />
      <img width="25px" height="25px" src={user} />
    </div>
  );
}

export default NavBar;
