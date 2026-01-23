export interface Vertex {
  x: number;
  y: number;
}

export interface Box3D {
  id: string;
  vertices: Vertex[]; // 8 vertices for 3D box
  dimensions: {
    width: number;  // cm
    height: number; // cm
    depth: number;  // cm
  };
  label: string;
  color: string;
  notes?: string; // AFEGEIX AQUESTA LÍNIA
}

export interface Measurement {
  id: string;
  name: string;
  photoUrl: string;
  photoBase64?: string;
  notes: string;
  boxes: Box3D[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Space {
  id: string;
  name: string;
  icon: string;
  measurements: Measurement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
}

export const BOX_COLORS = [
  { name: 'red', value: 'hsl(0, 84%, 60%)' },
  { name: 'blue', value: 'hsl(217, 91%, 60%)' },
  { name: 'green', value: 'hsl(142, 76%, 36%)' },
  { name: 'orange', value: 'hsl(25, 95%, 53%)' },
  { name: 'purple', value: 'hsl(270, 76%, 55%)' },
  { name: 'pink', value: 'hsl(330, 81%, 60%)' },
  { name: 'teal', value: 'hsl(175, 77%, 40%)' },
  { name: 'yellow', value: 'hsl(45, 93%, 47%)' },
];

export const SPACE_ICONS = [
  { name: 'Kitchen', icon: '🍽️' },
  { name: 'Bedroom', icon: '🛏️' },
  { name: 'Bathroom', icon: '🚿' },
  { name: 'Living Room', icon: '🛋️' },
  { name: 'Closet', icon: '👔' },
  { name: 'Office', icon: '💼' },
  { name: 'Garage', icon: '🚗' },
  { name: 'Garden', icon: '🌿' },
  { name: 'Other', icon: '📦' },
  { name: 'Bugaderia', icon: '🧼' },
  { name: 'Menjador', icon: '🪑' },
];
