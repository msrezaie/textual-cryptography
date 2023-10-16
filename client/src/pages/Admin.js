import { Outlet } from "react-router-dom";
import { SideBarNav } from "../components";
import AdminProtected from "./AdminProtected";
import adminLinks from "../util/adminNavLinks";
import { MainWrapper, SideNavWrapper } from "../assets/wrappers/ProfileWrapper";

const Admin = () => {
  return (
    <>
      <MainWrapper>
        <AdminProtected>
          <SideNavWrapper>
            <div className="sidebar show-sidebar">
              <SideBarNav links={adminLinks} />
            </div>
          </SideNavWrapper>
          <div className="pages">
            <Outlet />
          </div>
        </AdminProtected>
      </MainWrapper>
    </>
  );
};

export default Admin;
