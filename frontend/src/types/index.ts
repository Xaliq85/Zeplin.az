export type Role = 'admin' | 'seller' | 'warehouse' | 'courier'

export interface User {
  id: number
  phone: string
  first_name: string
  last_name: string
  role: Role
  is_active: boolean
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface Product {
  id: number
  seller: number
  name: string
  sku: string
  description: string
  price: string
  weight: string | null
  shelf_location: string
  quantity: number
  image: string | null
  is_active: boolean
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'in_delivery'
  | 'delivered'
  | 'picked_up'
  | 'cancelled'

export type OrderType = 'delivery' | 'pickup'

export interface OrderItem {
  id: number
  product: number
  quantity: number
  price: string
}

export interface Order {
  id: number
  customer_name: string
  customer_phone: string
  customer_address: string
  type: OrderType
  status: OrderStatus
  delivery_fee: string
  tracking_code: string
  note: string
  items: OrderItem[]
  created_at: string
}
