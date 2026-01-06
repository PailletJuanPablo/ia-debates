export type ViewpointType = 'favor' | 'contra' | 'neutral';

export interface Idea {
  id: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface Response {
  id: string;
  idea_id: string;
  content: string;
  viewpoint: ViewpointType;
  is_ai: boolean;
  author_name: string;
  created_at: string;
  parent_response_id: string | null;
}
