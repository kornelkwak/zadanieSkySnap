import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";

/**
 * Layout component that includes a top bar and an outlet for nested routes.
 * @returns {JSX.Element} - The rendered component.
 */
function Layout() {
    return (
      <>
        <TopBar />
        <Outlet />
      </>
    )
}

export default Layout;
