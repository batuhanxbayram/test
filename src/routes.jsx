import {
    HomeIcon,
    UserCircleIcon,
    TableCellsIcon,
    InformationCircleIcon,
    ServerStackIcon,
    RectangleStackIcon,
    TruckIcon,
    MapIcon,
    Squares2X2Icon,
    QueueListIcon,
    PaperAirplaneIcon,
} from "@heroicons/react/24/solid";


import {
    Home,
    Profile,
    Tables,
    Notifications,
    QueueManagementPage,
    DispatchPage,
} from "@/pages/dashboard";


import { SignIn } from "@/pages/auth";

const icon = {
    className: "w-5 h-5 text-inherit",
};

export const routes = [
    {
        layout: "dashboard",
        pages: [
            {
                icon: <Squares2X2Icon {...icon} />,
                name: "Araç Sıraları",
                path: "/home",
                element: <Home />,
            },
            {
                icon: <QueueListIcon {...icon} />,
                name: "Sıra Yönetimi",
                path: "/queue-management",
                element: <QueueManagementPage />,
                roles: ['admin'],
            },

            {
                icon: <PaperAirplaneIcon {...icon} />,
                name: "Özel Görev",
                path: "/dispatch",
                element: <DispatchPage />,
                roles: ['admin'],
            },
            {
                icon: <UserCircleIcon {...icon} />,
                name: "Kullanıcılar",
                path: "/profile",
                element: <Profile />,
                roles: ['admin'],
            },
            {
                icon: <TruckIcon {...icon} />,
                name: "Araçlar",
                path: "/tables",
                element: <Tables />,
                roles: ['admin'],
            },
            {
                icon: <MapIcon {...icon} />,
                name: "Güzergahlar",
                path: "/notifications",
                element: <Notifications />,
                roles: ['admin'],
            },
        ],
    },
    {
        title: "auth pages",
        layout: "auth",
        pages: [
            {
                icon: <ServerStackIcon {...icon} />,
                name: "sign in",
                path: "/sign-in",
                element: <SignIn />,
            },
        ],
    },
];

export default routes;