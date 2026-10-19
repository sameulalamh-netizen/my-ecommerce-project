import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    loginUser,
    logoutUser,
    getCurrentUser,
} from "../services/authServices";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // App load hole existing login check korbe
    const checkAuth = async () => {
        try {
            const data = await getCurrentUser();
             console.log(data)
            // Backend response-er structure onujayi user ber korbe
            setUser(data.user ?? data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Login function
    const login = async (credentials) => {
        await loginUser(credentials);

        // Login-er por current user-er details load korbe
        const data = await getCurrentUser();

        setUser(data.user ?? data);
    };

    // Logout function
    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Context use korar shortcut
export const useAuth = () => {
    return useContext(AuthContext);
};