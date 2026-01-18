import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Space, Measurement, Box3D, User } from '@/types';

// Simple UUID generator
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Claus per localStorage
const STORAGE_KEYS = {
  USER: 'mua_app_user',
  SPACES: 'mua_app_spaces',
};

// Funcions per guardar i carregar dades
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error guardant a localStorage:', error);
  }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    const parsed = JSON.parse(stored);
    
    // Convertir dates si és necessari
    if (key === STORAGE_KEYS.SPACES && Array.isArray(parsed)) {
      return parsed.map(space => ({
        ...space,
        createdAt: new Date(space.createdAt),
        updatedAt: new Date(space.updatedAt),
        measurements: space.measurements.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
        })),
      })) as T;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error carregant de localStorage:', error);
    return defaultValue;
  }
};

interface AppContextType {
  user: User | null;
  spaces: Space[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  createSpace: (name: string, icon: string) => void;
  updateSpace: (spaceId: string, updates: Partial<Space>) => void;
  deleteSpace: (spaceId: string) => void;
  addMeasurement: (spaceId: string, measurement: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMeasurement: (spaceId: string, measurementId: string, updates: Partial<Measurement>) => void;
  deleteMeasurement: (spaceId: string, measurementId: string) => void;
  addBox: (spaceId: string, measurementId: string, box: Omit<Box3D, 'id'>) => void;
  updateBox: (spaceId: string, measurementId: string, boxId: string, updates: Partial<Box3D>) => void;
  deleteBox: (spaceId: string, measurementId: string, boxId: string) => void;
  getSpace: (spaceId: string) => Space | undefined;
  getMeasurement: (spaceId: string, measurementId: string) => Measurement | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Demo data per quan no hi ha res guardat
const createDemoData = (): Space[] => [
  {
    id: generateId(),
    name: 'Kitchen',
    icon: '🍳',
    measurements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Bedroom',
    icon: '🛏️',
    measurements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  // Carregar dades de localStorage en iniciar
  const [user, setUser] = useState<User | null>(() => 
    loadFromStorage(STORAGE_KEYS.USER, {
      id: 'demo-user',
      email: 'demo@example.com',
      displayName: 'Demo User',
    })
  );
  
  const [spaces, setSpaces] = useState<Space[]>(() => {
    const stored = loadFromStorage<Space[]>(STORAGE_KEYS.SPACES, []);
    // Si no hi ha espais guardats, crear demo data
    return stored.length > 0 ? stored : createDemoData();
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = user !== null;

  // Guardar spaces cada vegada que canviïn
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SPACES, spaces);
  }, [spaces]);

  // Guardar user cada vegada que canviï
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER, user);
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate login - replace with Firebase
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser = {
      id: generateId(),
      email,
      displayName: email.split('@')[0],
    };
    setUser(newUser);
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser = {
      id: generateId(),
      email: 'google@example.com',
      displayName: 'Google User',
    };
    setUser(newUser);
    setIsLoading(false);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser = {
      id: generateId(),
      email,
      displayName,
    };
    setUser(newUser);
    setSpaces(createDemoData());
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setSpaces([]);
    // Esborrar dades de localStorage
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SPACES);
  };

  const createSpace = useCallback((name: string, icon: string) => {
    const newSpace: Space = {
      id: generateId(),
      name,
      icon,
      measurements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSpaces(prev => {
      const updated = [...prev, newSpace];
      return updated;
    });
  }, []);

  const updateSpace = useCallback((spaceId: string, updates: Partial<Space>) => {
    setSpaces(prev => {
      const updated = prev.map(space =>
        space.id === spaceId
          ? { ...space, ...updates, updatedAt: new Date() }
          : space
      );
      return updated;
    });
  }, []);

  const deleteSpace = useCallback((spaceId: string) => {
    setSpaces(prev => {
      const updated = prev.filter(space => space.id !== spaceId);
      return updated;
    });
  }, []);

  const addMeasurement = useCallback(
    (spaceId: string, measurement: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newMeasurement: Measurement = {
        ...measurement,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSpaces(prev => {
        const updated = prev.map(space =>
          space.id === spaceId
            ? {
                ...space,
                measurements: [...space.measurements, newMeasurement],
                updatedAt: new Date(),
              }
            : space
        );
        return updated;
      });
    },
    []
  );

  const updateMeasurement = useCallback(
    (spaceId: string, measurementId: string, updates: Partial<Measurement>) => {
      setSpaces(prev => {
        const updated = prev.map(space =>
          space.id === spaceId
            ? {
                ...space,
                measurements: space.measurements.map(m =>
                  m.id === measurementId
                    ? { ...m, ...updates, updatedAt: new Date() }
                    : m
                ),
                updatedAt: new Date(),
              }
            : space
        );
        return updated;
      });
    },
    []
  );

  const deleteMeasurement = useCallback((spaceId: string, measurementId: string) => {
    setSpaces(prev => {
      const updated = prev.map(space =>
        space.id === spaceId
          ? {
              ...space,
              measurements: space.measurements.filter(m => m.id !== measurementId),
              updatedAt: new Date(),
            }
          : space
      );
      return updated;
    });
  }, []);

  const addBox = useCallback(
    (spaceId: string, measurementId: string, box: Omit<Box3D, 'id'>) => {
      const newBox: Box3D = { ...box, id: generateId() };
      setSpaces(prev => {
        const updated = prev.map(space =>
          space.id === spaceId
            ? {
                ...space,
                measurements: space.measurements.map(m =>
                  m.id === measurementId
                    ? { ...m, boxes: [...m.boxes, newBox], updatedAt: new Date() }
                    : m
                ),
                updatedAt: new Date(),
              }
            : space
        );
        return updated;
      });
    },
    []
  );

  const updateBox = useCallback(
    (spaceId: string, measurementId: string, boxId: string, updates: Partial<Box3D>) => {
      setSpaces(prev => {
        const updated = prev.map(space =>
          space.id === spaceId
            ? {
                ...space,
                measurements: space.measurements.map(m =>
                  m.id === measurementId
                    ? {
                        ...m,
                        boxes: m.boxes.map(b =>
                          b.id === boxId ? { ...b, ...updates } : b
                        ),
                        updatedAt: new Date(),
                      }
                    : m
                ),
                updatedAt: new Date(),
              }
            : space
        );
        return updated;
      });
    },
    []
  );

  const deleteBox = useCallback((spaceId: string, measurementId: string, boxId: string) => {
    setSpaces(prev => {
      const updated = prev.map(space =>
        space.id === spaceId
          ? {
              ...space,
              measurements: space.measurements.map(m =>
                m.id === measurementId
                  ? { ...m, boxes: m.boxes.filter(b => b.id !== boxId), updatedAt: new Date() }
                  : m
              ),
              updatedAt: new Date(),
            }
          : space
      );
      return updated;
    });
  }, []);

  const getSpace = useCallback((spaceId: string) => {
    return spaces.find(s => s.id === spaceId);
  }, [spaces]);

  const getMeasurement = useCallback((spaceId: string, measurementId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    return space?.measurements.find(m => m.id === measurementId);
  }, [spaces]);

  return (
    <AppContext.Provider
      value={{
        user,
        spaces,
        isLoading,
        isAuthenticated,
        login,
        loginWithGoogle,
        signup,
        logout,
        createSpace,
        updateSpace,
        deleteSpace,
        addMeasurement,
        updateMeasurement,
        deleteMeasurement,
        addBox,
        updateBox,
        deleteBox,
        getSpace,
        getMeasurement,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
