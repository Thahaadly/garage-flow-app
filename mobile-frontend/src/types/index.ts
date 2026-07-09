export type ApiResponse<T> = {
  data: T;
  meta?: {
    code?: number;
    status?: string;
    message?: string;
  };
};

export type Service = {
  id: number;
  name: string;
  description?: string | null;
  estimated_price?: number | null;
  estimated_duration?: number | null;
  image?: string | null;
  thumbnail?: string | null;
};

export type Sparepart = {
  id: number;
  name: string;
  description?: string | null;
  price?: number | null;
  image?: string | null;
  thumbnail?: string | null;
};

export type Booking = {
  id: number;
  status?: string | null;
  booking_date?: string | null;
  scheduled_at?: string | null;
  total_price?: number | null;
  notes?: string | null;
  service?: Service | null;
  vehicle_id?: number | null;
  user?: any;
  vehicle?: any;
  payment?: any;
  items?: any[];
};

export type Vehicle = {
  id: number;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  color?: string | null;
  mileage?: number | null;
  fuel_type?: string | null;
  image_url?: string | null;
  last_service_mileage?: number | null;
  last_service_date?: string | null;
  battery_health?: string | null;
  tire_condition?: number | null;
};
