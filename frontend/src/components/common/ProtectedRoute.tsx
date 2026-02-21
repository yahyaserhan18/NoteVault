import { useAuthContext } from "@/context/AuthContext";
import { LoaderCircleIcon } from "lucide-react";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
    children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoaderCircleIcon className="animate-spin size-10" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/sign-in" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
