import { Toaster } from "react-hot-toast";
import { Outlet, ScrollRestoration } from "react-router-dom";

const Root: React.FC = () => {
  return (
    <>
      <ScrollRestoration />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "",
          style: {
            backgroundColor: "#C496FF",
            color: "white",
          },
        }}
      />
      <Outlet />
    </>
  );
};

export default Root;
