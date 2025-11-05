import { ArrowRightOnRectangleIcon, Bars3Icon } from "@heroicons/react/24/solid";
import { IconButton, Input, Navbar, Typography, Breadcrumbs } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useLocation, Link, useNavigate } from "react-router-dom"; 

// ===========================================
// 👇 DEĞİŞİKLİK BURADA 👇
// Haritaya "dispatch" için "Özel Görev" eklendi.
// ===========================================
const pageNamesMap = {
    home: "Araç Sıraları",
    "queue-management": "Sıra Yönetimi",
    profile: "Kullanıcılar",
    tables: "Araçlar",
    notifications: "Güzergahlar", 
    dispatch: "Özel Görev", // <-- YENİ EKLENEN SATIR
};


export function DashboardNavbar() {
    const [controller, dispatch] = useMaterialTailwindController();
    const { fixedNavbar, openSidenav } = controller;
    const { pathname } = useLocation();
    const [layout, urlPath] = pathname.split("/").filter((el) => el !== "");
    
    // URL'den gelen path'i (örneğin 'dispatch') Türkçe isme çevir
    const currentPageName = pageNamesMap[urlPath] || urlPath; 

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("authToken"); 
        localStorage.removeItem("userRole");  
        navigate("/auth/sign-in"); 
    };


    return (
        <Navbar
            color={fixedNavbar ? "white" : "transparent"}
            className={`rounded-xl transition-all ${
                fixedNavbar
                    ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
                    : "px-0 py-1"
            }`}
            fullWidth
            blurred={fixedNavbar}
        >
            <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-6">
                {/* Breadcrumbs ve sayfa başlığı */}
                {/* Breadcrumbs ve sayfa başlığı */}
              <div className="capitalize">
                  <Breadcrumbs
                      className={`bg-transparent p-0 transition-all ${fixedNavbar ? "mt-1" : ""}`}
                  >
                      <Link to={`/${layout}`}>
                          <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
                          >
                              Menü 
                          </Typography>
                      </Link>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                          {/* Breadcrumb'ın ikinci kısmı: Türkçe sayfa adı */}
                          {currentPageName}
                      </Typography>
                  </Breadcrumbs>
                  <Typography variant="h6" color="blue-gray" className="capitalize">
                      {/* Sayfa Ana Başlığı */}
                      {currentPageName}
                  </Typography>
              </div>

                {/* İkonlar */}
                <div className="flex items-center gap-4">
                    <IconButton
                        variant="text"
                        color="blue-gray"
                        className="grid xl:hidden"
                        onClick={() => setOpenSidenav(dispatch, !openSidenav)}
            _       >
                        <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
                    </IconButton>

                    <IconButton
                        variant="text"
                        color="red"
             _           onClick={handleLogout} 
                        className="rounded-full hover:bg-red-100 transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="h-6 w-6 text-red-500" />
                    </IconButton>
                </div>
            </div>
        </Navbar>
    );
}