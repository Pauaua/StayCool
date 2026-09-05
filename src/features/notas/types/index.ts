export interface QuickNote {
  id: string;
  logged_at: string;
  logged_date: string;
  name: string;
  description: string | null;
  feeling: string | null;
}

export interface DetailedNote {
  id: string;
  logged_at: string;
  logged_date: string;
  name: string;
  location: string | null;
  idea: string;
  feelings: string | null;
  thoughts: string | null;
}
