import { Outlet, ScrollRestoration } from "react-router-dom";

const Root: React.FC = () => {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
};

export default Root;
