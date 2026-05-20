export interface User {
  id: string;
  email: string;
  full_name: string;
  total_points: number;
  scan_count: number;
  streak_days: number;
  created_at: string;
}

export interface Detection {
  id: string;
  user_id: string;
  category: WasteCategory;
  confidence: number;
  points_earned: number;
  source: 'api' | 'on_device';
  image_path?: string;
  created_at: string;
}

export interface DisposalGuide {
  bin_color: string;
  method: string;
  tips: string[];
  recyclable: boolean;
  hazardous: boolean;
}

export interface ClassificationResult {
  category: WasteCategory;
  confidence: number;
  points_earned: number;
  disposal_guide: DisposalGuide;
  all_predictions: Array<{ category: string; confidence: number }>;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  total_points: number;
  scan_count: number;
  is_current_user: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost_points: number;
  icon: string;
  category: 'badge' | 'voucher' | 'achievement';
  is_active: boolean;
}

export type WasteCategory =
  | 'Plastic'
  | 'Cardboard'
  | 'Glass'
  | 'Metal'
  | 'Paper'
  | 'Organic'
  | 'E-Waste'
  | 'Textile'
  | 'Medical'
  | 'Battery'
  | 'Styrofoam'
  | 'General Trash';
