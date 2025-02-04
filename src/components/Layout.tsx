import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
function Layout() {
    return (
      <>
        <TopBar />
        <Outlet />
      </>
    )
  }
  
  export default Layout
  