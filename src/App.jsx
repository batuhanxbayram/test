import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import PrivateRoute from "../src/component/PrivateRoute";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        // DÜZELTME BURADA: Hepsini boş bir tag içine (<> ... </>) aldık.
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ zIndex: 999999 }}
            />

            <Routes>

                <Route
                    path="/dashboard/*"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />

                {/* Auth sayfaları (giriş, kayıt) herkes görebilir */}
                <Route path="/auth/*" element={<Auth />} />

                {/* Varsayılan yönlendirme */}
                <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
            </Routes>
        </>
    );
}

export default App;