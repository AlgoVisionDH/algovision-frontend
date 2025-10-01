import {createContext, useCallback, useContext, useEffect, useState} from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiFetch = useCallback(async (input, init = {}) => {
        const res = await fetch(input, {
            credentials: "include",
            headers: {"Content-Type": "application/json", ...(init.headers || {})},
            ...init,
        });

        if (res.status !== 401) return res;

        const refresh = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include"
        });
        if (!refresh.ok) {
            setUser(null);
            throw new Error("UNAUTHENTICATED");
        }

        return fetch(input, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(init.headers || {})
            },
            ...init,
        });
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const me = await apiFetch("/api/auth/me");
                if (me.ok) {
                    const data = await me.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (e) {
                setUser(null);
                setError(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [apiFetch]);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({email, password}),
            });
            if (!res.ok) throw new Error("LOGIN_FAILED");

            const me = await apiFetch("/api/auth/me");
            if (!me.ok) throw new Error("FAILED_TO_FETCH_ME");
            setUser(await me.json());
        } catch (e) {
            setUser(null);
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [apiFetch]);

    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", {method: "POST", credentials: "include"});
        } catch (_) {}
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{user, loading, error, login, logout, apiFetch}}>
            {children}
        </AuthContext.Provider>
    );
};