import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthUser,
  fetchMe,
  login as loginRequest,
  signup as signupRequest,
  updateProfile as updateProfileRequest,
} from '../../services/authApi';

const TOKEN_KEY = '@itreport/auth_token';
const USER_KEY = '@itreport/auth_user';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: { name?: string; avatar?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (!mounted) {
          return;
        }

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser) as AuthUser);

          try {
            const { user: fresh } = await fetchMe(savedToken);
            if (mounted) {
              setUser(fresh);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(fresh));
            }
          } catch {
            if (mounted) {
              setToken(null);
              setUser(null);
              await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
            }
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    await AsyncStorage.setItem(TOKEN_KEY, nextToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginRequest({ email, password });
      await persist(result.token, result.user);
    },
    [persist],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await signupRequest({ name, email, password });
      await persist(result.token, result.user);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }, []);

  const updateProfile = useCallback(
    async (payload: { name?: string; avatar?: string }) => {
      if (!token) {
        throw new Error('Not authenticated');
      }
      const { user: nextUser } = await updateProfileRequest(token, payload);
      setUser(nextUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    },
    [token],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
      updateProfile,
    }),
    [user, token, loading, login, signup, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
