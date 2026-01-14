import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

export function Sidenav({ brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav, userRole } = controller;

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  return (
    <>
      {/* Arka Plan Karartma (Overlay) */}
      <div
        className={`fixed inset-0 z-[999] bg-black/50 transition-opacity duration-300 xl:hidden ${
          openSidenav ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpenSidenav(dispatch, false)}
      />

      <aside
        className={`${sidenavTypes[sidenavType]} ${
          openSidenav ? "translate-x-0" : "-translate-x-80"
        } fixed inset-0 z-[1000] my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100 focus:outline-none`}
      >
        <div className="relative">
          {/* Logo Kısmı - Yazı kaldırıldı ve boşluk düzenlendi */}
          <div className="flex flex-col items-center py-8 px-8 text-center select-none">
            <img 
              src="/img/klogo.png" 
              alt="Logo" 
              className="w-32 h-32 mb-0 object-contain" 
            />
            {/* Typography (brandName) kısmı buradan silindi 💅 */}
          </div>
        </div>

        <div className="m-4">
          {routes && routes
            .filter((route) => route.layout === "anasayfa")
            .map(({ layout, pages }, key) => (
              <ul key={key} className="mb-4 flex flex-col gap-1">
                {pages && pages
                  .filter((page) => !page.roles || page.roles.includes(userRole))
                  .map(({ icon, name, path }) => (
                    <li key={name}>
                      <NavLink 
                        to={`/${layout}${path}`}
                        onClick={() => {
                          if (window.innerWidth < 1200) {
                            setOpenSidenav(dispatch, false);
                          }
                        }}
                      >
                        {({ isActive }) => (
                          <Button
                            variant={isActive ? "gradient" : "text"}
                            color={isActive ? sidenavColor : (sidenavType === "dark" ? "white" : "blue-gray")}
                            className="flex items-center gap-4 px-4 capitalize"
                            fullWidth
                          >
                            {icon}
                            <Typography color="inherit" className="font-medium capitalize">
                              {name}
                            </Typography>
                          </Button>
                        )}
                      </NavLink>
                    </li>
                  ))}
              </ul>
            ))}
        </div>
      </aside>
    </>
  );
}

Sidenav.defaultProps = {
  brandName: "S.S. 75 NO'LU KOOP",
};

Sidenav.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.array.isRequired,
};

export default Sidenav;