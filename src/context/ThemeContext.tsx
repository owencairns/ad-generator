import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => Promise<void>;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light');
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const { user } = useAuth();

    // Client-side only code
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Initialize theme from localStorage and sync with Firebase
    useEffect(() => {
        if (!isMounted) return;

        const initializeTheme = async () => {
            try {
                // First check localStorage
                const cachedTheme = localStorage.getItem('theme') as Theme | null;
                
                if (user) {
                    // If user is logged in, fetch from Firebase
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    const userData = userDoc.data();
                    
                    if (userData?.theme) {
                        // If theme exists in Firebase, use it and update localStorage
                        setThemeState(userData.theme);
                        localStorage.setItem('theme', userData.theme);
                    } else if (cachedTheme) {
                        // If theme exists in localStorage but not Firebase, update Firebase
                        await setDoc(doc(db, 'users', user.uid), { theme: cachedTheme }, { merge: true });
                        setThemeState(cachedTheme);
                    } else {
                        // If no theme preference exists anywhere, default to system preference
                        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                        await setDoc(doc(db, 'users', user.uid), { theme: systemTheme }, { merge: true });
                        localStorage.setItem('theme', systemTheme);
                        setThemeState(systemTheme);
                    }
                } else if (cachedTheme) {
                    // If user is not logged in but theme exists in localStorage, use it
                    setThemeState(cachedTheme);
                } else {
                    // If no user and no cached theme, use system preference
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    localStorage.setItem('theme', systemTheme);
                    setThemeState(systemTheme);
                }
            } catch (error) {
                console.error('Error initializing theme:', error);
                // Fallback to light theme if there's an error
                setThemeState('light');
            } finally {
                setIsLoading(false);
            }
        };

        initializeTheme();
    }, [user, isMounted]);

    // Update theme in both localStorage and Firebase
    const setTheme = async (newTheme: Theme) => {
        try {
            setThemeState(newTheme);
            
            if (isMounted) {
                localStorage.setItem('theme', newTheme);
                
                if (user) {
                    await setDoc(doc(db, 'users', user.uid), { theme: newTheme }, { merge: true });
                }
                
                // Apply theme to document
                document.documentElement.setAttribute('data-theme', newTheme);
            }
        } catch (error) {
            console.error('Error updating theme:', error);
            // Revert to previous theme if there's an error
            setThemeState(theme);
            if (isMounted) {
                localStorage.setItem('theme', theme);
            }
        }
    };

    // Apply theme to document whenever it changes
    useEffect(() => {
        if (isMounted) {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme, isMounted]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
} 